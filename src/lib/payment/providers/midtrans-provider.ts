import { createHash } from 'crypto'
import type {
  PaymentProvider,
  PaymentProviderName,
  CheckoutRequest,
  CheckoutResult,
  NotificationResult,
  DonationStatus,
} from '../types'

export class MidtransProvider implements PaymentProvider {
  readonly name: PaymentProviderName = 'midtrans'

  private get serverKey() {
    const key = process.env.MIDTRANS_SERVER_KEY
    if (!key) throw new Error('MIDTRANS_SERVER_KEY tidak dikonfigurasi')
    return key
  }

  private get snapUrl() {
    const isProd = process.env.MIDTRANS_IS_PRODUCTION === 'true'
    return isProd
      ? 'https://api.midtrans.com/snap/v1/transactions'
      : 'https://api.sandbox.midtrans.com/snap/v1/transactions'
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const authHeader = 'Basic ' + Buffer.from(`${this.serverKey}:`).toString('base64')

    const payload = {
      transaction_details: { order_id: req.orderId, gross_amount: req.amount },
      item_details: req.items.map((i) => ({
        id: i.id,
        price: i.price,
        quantity: i.quantity,
        name: i.name,
      })),
      customer_details: {
        first_name: req.donorName,
        phone: req.donorPhone || '',
      },
      callbacks: { finish: req.finishUrl },
      notification_url: req.notificationUrl,
    }

    const res = await fetch(this.snapUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: authHeader,
      },
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || 'Gagal membuat Snap token')
    }

    const data = await res.json()
    return {
      provider: 'midtrans',
      token: data.token,
      redirectUrl: data.redirect_url,
    }
  }

  async verifyAndParseNotification(body: unknown, _headers: Headers): Promise<NotificationResult> {
    const payload = body as Record<string, string>
    const orderId = payload.order_id
    const statusCode = payload.status_code
    const grossAmount = payload.gross_amount
    const signatureKey = (payload.signature_key || '').toLowerCase()

    if (!orderId || !statusCode || !grossAmount) {
      throw new Error('Payload Midtrans tidak lengkap')
    }

    const expected = this.computeSignature(orderId, statusCode, grossAmount, this.serverKey).toLowerCase()

    if (!signatureKey || signatureKey !== expected) {
      const alt = grossAmount.includes('.')
        ? grossAmount.split('.')[0]
        : `${grossAmount}.00`
      const expectedAlt = this.computeSignature(orderId, statusCode, alt, this.serverKey).toLowerCase()
      if (signatureKey !== expectedAlt) {
        throw new Error('Signature tidak valid')
      }
    }

    return { orderId, status: this.mapStatus(payload) }
  }

  private computeSignature(orderId: string, statusCode: string, grossAmount: string, key: string) {
    return createHash('sha512')
      .update(`${orderId}${statusCode}${grossAmount}${key}`)
      .digest('hex')
  }

  private mapStatus(payload: Record<string, string>): DonationStatus | null {
    const ts = (payload.transaction_status || '').toLowerCase()
    const fs = (payload.fraud_status || '').toLowerCase()

    if (ts === 'settlement') return 'SETTLED'
    if (ts === 'capture') return fs === 'accept' ? 'PAID' : 'PENDING'
    if (ts === 'pending') return 'PENDING'
    if (ts === 'deny' || ts === 'cancel' || ts === 'expire' || ts === 'failure') return 'FAILED'
    if (ts === 'refund' || ts === 'partial_refund' || ts === 'chargeback' || ts === 'partial_chargeback')
      return 'REFUNDED'
    return null
  }
}
