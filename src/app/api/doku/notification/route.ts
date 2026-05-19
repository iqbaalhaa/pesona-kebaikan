import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { createNotification } from '@/actions/notification'
import { NotificationType } from '@prisma/client'
import { DokuProvider } from '@/lib/payment/providers/doku-provider'

const provider = new DokuProvider()

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
    }

    let result
    try {
      result = await provider.verifyAndParseNotification(body, req.headers)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Verifikasi gagal'
      console.error('DOKU notification verify error:', msg)
      return NextResponse.json({ success: false, error: msg }, { status: 401 })
    }

    const { orderId, status } = result
    console.log('DOKU Notification:', { orderId, status })

    if (!status) {
      return NextResponse.json({ success: true })
    }

    const existing = await prisma.donation.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        userId: true,
        amount: true,
        donorName: true,
        donorPhone: true,
        campaign: { select: { slug: true, id: true, title: true } },
      },
    })

    if (!existing) {
      console.error(`Donation not found: ${orderId}`)
      return NextResponse.json({ success: true })
    }

    await prisma.donation.update({ where: { id: orderId }, data: { status } })

    if (status === 'PAID' || status === 'SETTLED') {
      let targetUserId = existing.userId as string | undefined
      if (!targetUserId) {
        const byPhone = await prisma.user.findUnique({
          where: { phone: existing.donorPhone || '' },
          select: { id: true },
        })
        targetUserId = byPhone?.id
      }
      if (targetUserId) {
        const amountNum = Number(existing.amount)
        const amountStr = isFinite(amountNum) ? amountNum.toLocaleString('id-ID') : `${existing.amount}`
        await createNotification(
          targetUserId,
          'Donasi Berhasil',
          `Terima kasih. Donasi Rp ${amountStr} ke ${existing.campaign?.title || 'Campaign'} telah berhasil.`,
          NotificationType.KABAR
        )
      }
    }

    revalidatePath('/admin/transaksi')
    revalidatePath('/donasi')
    revalidatePath('/donasi-saya')
    revalidatePath('/')
    revalidatePath('/galang-dana')
    if (existing.campaign?.slug) {
      revalidatePath(`/donasi/${existing.campaign.slug}`)
      revalidatePath(`/galang-dana/${existing.campaign.slug}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DOKU notification error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan memproses notifikasi' }, { status: 500 })
  }
}
