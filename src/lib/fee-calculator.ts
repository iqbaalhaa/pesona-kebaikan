
export function calculateDokuFee(amount: number, paymentMethod: string): number {
  const method = paymentMethod.toUpperCase();
  if (method === "QRIS") return Math.round(amount * 0.007);
  if (method === "EWALLET") return Math.round(amount * 0.015);
  if (method === "VIRTUAL_ACCOUNT" || method === "BANK_TRANSFER") return 4500;
  if (method === "CARD" || method === "CREDIT_CARD") return Math.round(amount * 0.025) + 2000;
  return 4500;
}

export function calculatePaymentFee(amount: number, paymentMethod: string): number {
  return calculateDokuFee(amount, paymentMethod);
}
