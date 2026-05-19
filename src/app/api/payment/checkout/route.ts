import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPaymentProvider } from '@/lib/payment'

export async function POST(req: Request) {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || new URL(req.url).origin
    const body = await req.json()
    const donationId = body?.donationId as string | undefined

    if (!donationId) {
      return NextResponse.json({ success: false, error: 'donationId wajib diisi' }, { status: 400 })
    }

    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
      include: { campaign: { select: { title: true, slug: true, id: true } } },
    })

    if (!donation) {
      return NextResponse.json({ success: false, error: 'Donasi tidak ditemukan' }, { status: 404 })
    }

    const provider = getPaymentProvider()
    const amount = Math.max(1, Math.round(Number(donation.amount)))
    const itemName = `Donasi - ${donation.campaign?.title || 'Campaign'}`.slice(0, 50)
    const campaignSlug = donation.campaign?.slug || donation.campaignId

    const result = await provider.createCheckout({
      orderId: donation.id,
      amount,
      donorName: donation.donorName || 'Donatur',
      donorPhone: donation.donorPhone || '',
      items: [{ id: donation.campaignId, name: itemName, price: amount, quantity: 1 }],
      notificationUrl: `${origin}/api/${provider.name}/notification`,
      finishUrl: `${origin}/donasi/${campaignSlug}?donation_success=true`,
    })

    return NextResponse.json({
      success: true,
      provider: result.provider,
      token: result.token,
      redirect_url: result.redirectUrl,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan saat membuat checkout'
    console.error('Payment checkout error:', error)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
