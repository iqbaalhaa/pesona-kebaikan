export type PaymentProviderName = 'midtrans' | 'doku'

export interface CheckoutItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface CheckoutRequest {
  orderId: string
  amount: number
  donorName: string
  donorPhone?: string
  items: CheckoutItem[]
  notificationUrl: string
  finishUrl: string
}

export interface CheckoutResult {
  provider: PaymentProviderName
  token?: string
  redirectUrl: string
}

export type DonationStatus = 'PAID' | 'SETTLED' | 'PENDING' | 'FAILED' | 'REFUNDED'

export interface NotificationResult {
  orderId: string
  status: DonationStatus | null
}

export interface PaymentProvider {
  readonly name: PaymentProviderName
  createCheckout(req: CheckoutRequest): Promise<CheckoutResult>
  verifyAndParseNotification(body: unknown, headers: Headers): Promise<NotificationResult>
}
