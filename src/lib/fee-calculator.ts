
export function calculateMidtransFee(amount: number, paymentMethod: string): number {
  const method = paymentMethod.toUpperCase();
  if (method === "EWALLET" || method === "GOPAY" || method === "SHOPEEPAY" || method === "QRIS") {
    return Math.round(amount * 0.02);
  }
  if (method === "VIRTUAL_ACCOUNT" || method === "BANK_TRANSFER" || method === "PERMATA" || method === "BCA" || method === "MANDIRI" || method === "BNI" || method === "BRI") {
    return 4000;
  }
  if (method === "CARD" || method === "CREDIT_CARD") {
    return Math.round(amount * 0.029) + 2000;
  }
  return 4000;
}

export function calculateDokuFee(amount: number, paymentMethod: string): number {
  const method = paymentMethod.toUpperCase();
  if (method === "QRIS") return Math.round(amount * 0.007);
  if (method === "EWALLET") return Math.round(amount * 0.015);
  if (method === "VIRTUAL_ACCOUNT" || method === "BANK_TRANSFER") return 4500;
  if (method === "CARD" || method === "CREDIT_CARD") return Math.round(amount * 0.025) + 2000;
  return 4500;
}

export function calculatePaymentFee(amount: number, paymentMethod: string): number {
  const provider = (process.env.PAYMENT_PROVIDER || "midtrans").toLowerCase();
  if (provider === "doku") return calculateDokuFee(amount, paymentMethod);
  return calculateMidtransFee(amount, paymentMethod);
}
