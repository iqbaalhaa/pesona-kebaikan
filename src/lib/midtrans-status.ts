export async function checkMidtransStatus(orderId: string) {
	try {
		const serverKey = process.env.MIDTRANS_SERVER_KEY;
		const isProd = process.env.MIDTRANS_IS_PRODUCTION === "true";
		const baseUrl = isProd
			? "https://api.midtrans.com/v2"
			: "https://api.sandbox.midtrans.com/v2";

		const authHeader =
			"Basic " + Buffer.from(`${serverKey}:`).toString("base64");

		const res = await fetch(`${baseUrl}/${orderId}/status`, {
			headers: {
				Authorization: authHeader,
				Accept: "application/json",
				"Content-Type": "application/json",
			},
			cache: "no-store",
		});

		if (!res.ok) return null;

		const data = await res.json();
		return data; // returns full midtrans status object
	} catch (error) {
		console.error(`Failed to check Midtrans status for ${orderId}:`, error);
		return null;
	}
}

export function mapMidtransToInternal(status: string, fraud: string = "") {
	const s = (status || "").toLowerCase();
	const f = (fraud || "").toLowerCase();

	if (s === "settlement" || s === "capture") {
		if (s === "capture" && f === "challenge") return "PENDING";
		return "PAID";
	}
	if (s === "pending") return "PENDING";
	if (s === "deny" || s === "cancel" || s === "expire" || s === "failure")
		return "FAILED";
	if (s === "refund" || s === "partial_refund" || s === "chargeback")
		return "REFUNDED";

	return "PENDING";
}
