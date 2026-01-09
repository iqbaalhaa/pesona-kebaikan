import axios from "axios";

const IRIS_API_KEY = process.env.MIDTRANS_SERVER_KEY || "";
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";

const BASE_URL = IS_PRODUCTION
	? "https://app.midtrans.com/iris/api/v1"
	: "https://app.sandbox.midtrans.com/iris/api/v1";

// Iris requires Basic Auth with API Key as username and empty password
const authHeader = Buffer.from(`${IRIS_API_KEY}:`).toString("base64");

const irisClient = axios.create({
	baseURL: BASE_URL,
	headers: {
		Authorization: `Basic ${authHeader}`,
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

export type PayoutPayload = {
	payouts: {
		beneficiary_name: string;
		beneficiary_account: string;
		beneficiary_bank: string;
		beneficiary_email?: string;
		amount: string;
		notes: string;
	}[];
};

export async function createPayout(payload: PayoutPayload) {
	try {
		const response = await irisClient.post("/payouts", payload);
		return response.data;
	} catch (error: any) {
		console.error(
			"Iris Create Payout Error:",
			error.response?.data || error.message
		);
		throw new Error(
			error.response?.data?.message || "Failed to create payout via Iris"
		);
	}
}

export async function approvePayout(reference_nos: string[]) {
	try {
		const response = await irisClient.post("/payouts/approve", {
			reference_nos,
		});
		return response.data;
	} catch (error: any) {
		console.error(
			"Iris Approve Payout Error:",
			error.response?.data || error.message
		);
		throw new Error(
			error.response?.data?.message || "Failed to approve payout via Iris"
		);
	}
}

export async function getPayoutDetails(reference_no: string) {
	try {
		const response = await irisClient.get(`/payouts/${reference_no}`);
		return response.data;
	} catch (error: any) {
		console.error(
			"Iris Get Payout Details Error:",
			error.response?.data || error.message
		);
		throw new Error(
			error.response?.data?.message || "Failed to get payout details via Iris"
		);
	}
}
