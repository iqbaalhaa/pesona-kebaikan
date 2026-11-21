import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { applyDonationStatus } from '@/lib/donation-settlement'
import { DokuProvider } from '@/lib/payment/providers/doku-provider'

const provider = new DokuProvider()

export async function GET() {
  return NextResponse.json({ ok: true, endpoint: '/api/doku/notification' })
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text()
    console.log('[DOKU webhook] incoming', {
      headers: {
        'Client-Id': req.headers.get('Client-Id'),
        'Request-Id': req.headers.get('Request-Id'),
        'Request-Timestamp': req.headers.get('Request-Timestamp'),
        Signature: req.headers.get('Signature'),
      },
      bodyPreview: rawBody.slice(0, 500),
    })

    let body: unknown
    try {
      body = JSON.parse(rawBody)
    } catch {
      console.error('[DOKU webhook] body bukan JSON valid')
      return NextResponse.json({ success: false, error: 'Body tidak valid' }, { status: 400 })
    }

    let result
    try {
      result = await provider.verifyAndParseNotification(rawBody, req.headers)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Verifikasi gagal'
      console.error('[DOKU webhook] verify error:', msg)
      return NextResponse.json({ success: false, error: msg }, { status: 401 })
    }

    const { orderId, status } = result
    console.log('[DOKU webhook] parsed', { orderId, status })

    if (!status) {
      return NextResponse.json({ success: true })
    }

    const existing = await prisma.donation.findUnique({
      where: { id: orderId },
      select: { id: true, campaign: { select: { slug: true } } },
    })

    if (!existing) {
      console.error(`[DOKU webhook] donation not found: ${orderId}`)
      return NextResponse.json({ success: true })
    }

    // Notification + Meta CAPI run inside, only on the first move into PAID.
    const { changed } = await applyDonationStatus(orderId, status)
    console.log(`[DOKU webhook] donation ${orderId} status -> ${status}${changed ? '' : ' (unchanged)'}`)

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
