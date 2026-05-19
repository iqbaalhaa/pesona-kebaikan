import type { PaymentProvider } from './types'
import { MidtransProvider } from './providers/midtrans-provider'
import { DokuProvider } from './providers/doku-provider'

export function getPaymentProvider(): PaymentProvider {
  const name = (process.env.PAYMENT_PROVIDER || 'midtrans').toLowerCase()
  if (name === 'doku') return new DokuProvider()
  return new MidtransProvider()
}

export type { PaymentProvider, CheckoutRequest, CheckoutResult, NotificationResult, PaymentProviderName } from './types'
