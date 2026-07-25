import type { PaymentProvider } from './types'
import { DokuProvider } from './providers/doku-provider'

export function getPaymentProvider(): PaymentProvider {
  return new DokuProvider()
}

export type { PaymentProvider, CheckoutRequest, CheckoutResult, NotificationResult, PaymentProviderName } from './types'
