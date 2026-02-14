import axios from "axios";

const RAW_IRIS_KEY = (process.env.MIDTRANS_IRIS_API_KEY || "").trim();
const RAW_SERVER_KEY = (process.env.MIDTRANS_SERVER_KEY || "").trim();
const IRIS_API_KEY = (RAW_IRIS_KEY || RAW_SERVER_KEY).trim();
const USING_SERVER_KEY_FALLBACK = !RAW_IRIS_KEY && !!RAW_SERVER_KEY;
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === "true";
const IRIS_DEBUG = process.env.MIDTRANS_IRIS_DEBUG === "true";
const IRIS_TIMEOUT_MS = Math.max(
	1,
	Number(process.env.MIDTRANS_IRIS_TIMEOUT_MS || 30000),
);

// MOCK MODE: Enabled if explicitly set OR if Production is enabled but keys are missing
const IS_MOCK =
	process.env.MIDTRANS_IRIS_MOCK === "true" || (IS_PRODUCTION && !IRIS_API_KEY);

if (IS_MOCK) {
	console.log(
		"------------------------------------------------------------------",
	);
	console.log("⚠️  MIDTRANS IRIS MOCK MODE ENABLED ⚠️");
	console.log("Transactions will be simulated. No real money will be moved.");
	console.log(
		"Reason: MIDTRANS_IRIS_MOCK=true OR (IS_PRODUCTION=true AND Missing Keys)",
	);
	console.log(
		"------------------------------------------------------------------",
	);
}

const BASE_URL = IS_PRODUCTION
	? "https://app.midtrans.com/iris/api/v1"
	: "https://app.sandbox.midtrans.com/iris/api/v1";

const authHeader = Buffer.from(`${IRIS_API_KEY}:`).toString("base64");

const irisClient = axios.create({
	baseURL: BASE_URL,
	timeout: IRIS_TIMEOUT_MS,
	headers: {
		Authorization: `Basic ${authHeader}`,
		"Content-Type": "application/json",
		Accept: "application/json",
		"X-Iris-User-Agent": "PesonaKebaikan/1.0",
	},
});

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function shouldRetryNetworkError(code: string | undefined) {
	return (
		code === "ENOTFOUND" ||
		code === "EAI_AGAIN" ||
		code === "ECONNRESET" ||
		code === "ETIMEDOUT"
	);
}

async function postWithRetry<TResponse>(url: string, data: unknown) {
	const maxAttempts = 3;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await irisClient.post<TResponse>(url, data);
		} catch (err) {
			if (!axios.isAxiosError(err)) throw err;
			if (!shouldRetryNetworkError(err.code) || attempt === maxAttempts)
				throw err;
			await sleep(400 * attempt);
		}
	}
	throw new Error("Failed to call Iris");
}

async function getWithRetry<TResponse>(url: string) {
	const maxAttempts = 3;
	for (let attempt = 1; attempt <= maxAttempts; attempt++) {
		try {
			return await irisClient.get<TResponse>(url);
		} catch (err) {
			if (!axios.isAxiosError(err)) throw err;
			if (!shouldRetryNetworkError(err.code) || attempt === maxAttempts)
				throw err;
			await sleep(400 * attempt);
		}
	}
	throw new Error("Failed to call Iris");
}

irisClient.interceptors.request.use((request) => {
	if (IRIS_DEBUG) {
		console.log(
			`[Iris] Request: ${request.method?.toUpperCase()} ${request.url}`,
		);
		console.log(
			`[Iris] Auth Header Present: ${!!request.headers.Authorization}`,
		);
	}
	return request;
});

irisClient.interceptors.response.use(
	(response) => response,
	(error) => {
		if (IRIS_DEBUG && error.response) {
			console.error(
				`[Iris] API Error ${error.response.status}:`,
				JSON.stringify(error.response.data),
			);
		}
		return Promise.reject(error);
	},
);

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
	if (IS_MOCK) {
		console.log("[Iris Mock] createPayout called with:", payload);
		return {
			payouts: payload.payouts.map(() => ({
				status: "queued",
				reference_no: `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
			})),
		};
	}

	try {
		if (!IRIS_API_KEY) {
			throw new Error(
				"MIDTRANS_IRIS_API_KEY / MIDTRANS_SERVER_KEY belum diisi",
			);
		}
		if (IRIS_DEBUG) {
			console.log(
				`[Iris] Creating payout. Environment: ${
					IS_PRODUCTION ? "PRODUCTION" : "SANDBOX"
				}. Key Prefix: ${IRIS_API_KEY.substring(0, 6)}...`,
			);
			if (USING_SERVER_KEY_FALLBACK) {
				console.log(
					"[Iris] Using MIDTRANS_SERVER_KEY fallback (MIDTRANS_IRIS_API_KEY empty)",
				);
			}
		}
		const response = await postWithRetry<unknown>("/payouts", payload);
		return response.data as unknown;
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			const data = err.response?.data;
			console.error("Iris Create Payout Error:", data || err.message);

			let msg =
				data?.message ||
				(err.code
					? `${err.code}: ${err.message}`
					: "Failed to create payout via Iris");
			if (data?.error_messages && Array.isArray(data.error_messages)) {
				msg = `${msg}: ${data.error_messages.join(", ")}`;
			} else if (data?.errors) {
				// sometimes errors is array or object
				if (Array.isArray(data.errors)) {
					msg = `${msg}: ${data.errors.join(", ")}`;
				} else if (typeof data.errors === "object") {
					msg = `${msg}: ${JSON.stringify(data.errors)}`;
				}
			}

			// Handle "Access denied" specifically to give better hints
			if (msg.includes("Access denied")) {
				msg +=
					". Pastikan MIDTRANS_IRIS_API_KEY (Iris API Key Production) benar dan IP server sudah di-whitelist di Midtrans Iris.";
			}
			if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
				msg +=
					" (DNS bermasalah. Cek koneksi internet/DNS/VPN/Proxy pada server Anda.)";
			}

			throw new Error(msg);
		}
		throw new Error("Failed to create payout via Iris");
	}
}

export async function approvePayout(reference_nos: string[], otp: string) {
	if (IS_MOCK) {
		console.log(
			"[Iris Mock] approvePayout called for:",
			reference_nos,
			"OTP:",
			otp,
		);
		return {
			status: "approved",
			message: "Mock payout approved successfully",
		};
	}

	try {
		const response = await postWithRetry<unknown>("/payouts/approve", {
			reference_nos,
			otp,
		});
		return response.data as unknown;
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			const data = err.response?.data;
			console.error("Iris Approve Payout Error:", data || err.message);

			let msg = data?.message || "Failed to approve payout via Iris";
			if (data?.error_messages && Array.isArray(data.error_messages)) {
				msg = `${msg}: ${data.error_messages.join(", ")}`;
			}

			throw new Error(msg);
		}
		throw new Error("Failed to approve payout via Iris");
	}
}

export async function getPayoutDetails(reference_no: string) {
	if (IS_MOCK) {
		return {
			reference_no,
			status: "completed",
			amount: "50000",
			beneficiary_name: "Mock Beneficiary",
			beneficiary_account: "1234567890",
			beneficiary_bank: "bca",
			updated_at: new Date().toISOString(),
			created_at: new Date().toISOString(),
			notes: "Mock transaction",
		};
	}

	try {
		const response = await getWithRetry<unknown>(`/payouts/${reference_no}`);
		return response.data as unknown;
	} catch (err: unknown) {
		if (axios.isAxiosError(err)) {
			console.error(
				"Iris Get Payout Details Error:",
				err.response?.data || err.message,
			);
			throw new Error(
				err.response?.data?.message || "Failed to get payout details via Iris",
			);
		}
		throw new Error("Failed to get payout details via Iris");
	}
}
