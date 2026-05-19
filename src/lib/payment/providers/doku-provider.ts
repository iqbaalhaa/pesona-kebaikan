import { createHmac, createHash, randomUUID } from 'crypto'
import type {
  PaymentProvider,
  PaymentProviderName,
  CheckoutRequest,
  CheckoutResult,
  NotificationResult,
  DonationStatus,
} from '../types'

const BASE_PROD = 'https://api.doku.com'
const BASE_SANDBOX = 'https://api-sandbox.doku.com'
const CHECKOUT_TARGET = '/checkout/v1/payment'
const NOTIFICATION_PATH = '/api/doku/notification'

export class DokuProvider implements PaymentProvider {
  readonly name: PaymentProviderName = 'doku'

  private get clientId() {
    const id = process.env.DOKU_CLIENT_ID
    if (!id) throw new Error('DOKU_CLIENT_ID tidak dikonfigurasi')
    return id
  }

  private get secretKey() {
    const key = process.env.DOKU_SECRET_KEY
    if (!key) throw new Error('DOKU_SECRET_KEY tidak dikonfigurasi')
    return key
  }

  private get baseUrl() {
    return process.env.DOKU_IS_PRODUCTION === 'true' ? BASE_PROD : BASE_SANDBOX
  }

  private get paymentMethodTypes(): string[] {
    const env = process.env.DOKU_PAYMENT_METHODS
    if (!env) return []
    return env.split(',').map((s) => s.trim()).filter(Boolean)
  }

  async createCheckout(req: CheckoutRequest): Promise<CheckoutResult> {
    const requestId = randomUUID()
    const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')

    const body = JSON.stringify({
      order: {
        invoice_number: req.orderId,
        line_items: req.items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        amount: req.amount,
        currency: 'IDR',
        callback_url: req.finishUrl,
        auto_redirect: true,
      },
      payment: {
        payment_due_date: 60,
        ...(this.paymentMethodTypes.length ? { payment_method_types: this.paymentMethodTypes } : {}),
      },
      customer: {
        name: req.donorName,
        ...(/^\d{5,16}$/.test(req.donorPhone?.replace(/\D/g, '') || '') ? { phone: req.donorPhone!.replace(/\D/g, '') } : {}),
      },
      additional_info: {
        override_notification_url: req.notificationUrl,
      },
    })

    const signature = this.computeRequestSignature(requestId, timestamp, body)

    const res = await fetch(`${this.baseUrl}${CHECKOUT_TARGET}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'Client-Id': this.clientId,
        'Request-Id': requestId,
        'Request-Timestamp': timestamp,
        Signature: signature,
      },
      body,
    })

    if (!res.ok) {
      const errText = await res.text()
      throw new Error(errText || 'Gagal membuat DOKU payment')
    }

    const data = await res.json()
    const redirectUrl = (data?.response?.payment?.url ?? data?.payment?.url) as string | undefined
    if (!redirectUrl) throw new Error('DOKU tidak mengembalikan payment URL: ' + JSON.stringify(data))

    return { provider: 'doku', redirectUrl }
  }

  async verifyAndParseNotification(body: unknown, headers: Headers): Promise<NotificationResult> {
    const clientId = headers.get('Client-Id') || ''
    const requestId = headers.get('Request-Id') || ''
    const timestamp = headers.get('Request-Timestamp') || ''
    const receivedSig = headers.get('Signature') || ''

    const bodyStr = typeof body === 'string' ? body : JSON.stringify(body)
    const digest = createHash('sha256').update(bodyStr).digest('base64')
    const stringToSign = [
      `Client-Id:${clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${timestamp}`,
      `Request-Target:${NOTIFICATION_PATH}`,
      `Digest:${digest}`,
    ].join('\n')
    const expected = 'HMACSHA256=' + createHmac('sha256', this.secretKey).update(stringToSign).digest('base64')

    if (receivedSig !== expected) {
      throw new Error('Signature DOKU tidak valid')
    }

    const payload = (typeof body === 'string' ? JSON.parse(body) : body) as Record<string, any>
    const orderId = payload?.order?.invoice_number as string | undefined
    if (!orderId) throw new Error('invoice_number tidak ditemukan di notifikasi DOKU')

    const transactionStatus = ((payload?.transaction?.status as string) || '').toUpperCase()

    return { orderId, status: this.mapStatus(transactionStatus) }
  }

  private mapStatus(status: string): DonationStatus | null {
    switch (status) {
      case 'SUCCESS': return 'PAID'
      case 'PENDING': return 'PENDING'
      case 'FAILED':
      case 'EXPIRED': return 'FAILED'
      default: return null
    }
  }

  private computeRequestSignature(requestId: string, timestamp: string, body: string): string {
    const digest = createHash('sha256').update(body).digest('base64')
    const stringToSign = [
      `Client-Id:${this.clientId}`,
      `Request-Id:${requestId}`,
      `Request-Timestamp:${timestamp}`,
      `Request-Target:${CHECKOUT_TARGET}`,
      `Digest:${digest}`,
    ].join('\n')
    return 'HMACSHA256=' + createHmac('sha256', this.secretKey).update(stringToSign).digest('base64')
  }
}
