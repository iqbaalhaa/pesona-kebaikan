
export function calculateMidtransFee(amount: number, paymentMethod: string): number {
  const method = paymentMethod.toUpperCase();
  
  // Fee estimates based on Midtrans pricing (simplified)
  // These should be adjusted to match actual contract rates
  
  if (method === "EWALLET" || method === "GOPAY" || method === "SHOPEEPAY" || method === "QRIS") {
    // ~2% for E-Wallets/QRIS
    return Math.round(amount * 0.02);
  }
  
  if (method === "VIRTUAL_ACCOUNT" || method === "BANK_TRANSFER" || method === "PERMATA" || method === "BCA" || method === "MANDIRI" || method === "BNI" || method === "BRI") {
    // ~Rp 4,000 flat for VA
    return 4000;
  }
  
  if (method === "CARD" || method === "CREDIT_CARD") {
    // ~2.9% + Rp 2,000 for Cards
    return Math.round(amount * 0.029) + 2000;
  }

  // Default fallback (e.g. for TRANSFER or unknown)
  return 4000;
}
