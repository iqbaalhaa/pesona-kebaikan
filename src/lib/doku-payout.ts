import { createSign, createHmac, createHash, randomUUID } from "crypto";

/**
 * DOKU Payout ("Kirim DOKU") client.
 *
 * IMPORTANT: this is a SEPARATE DOKU product from the checkout integration in
 * `src/lib/payment/providers/doku-provider.ts`. Checkout uses a simple
 * Client-Id/Secret-Key HMAC-SHA256 scheme; Payout uses DOKU's SNAP-based auth:
 * an OAuth B2B token signed with an RSA private key (registered with DOKU),
 * then HMAC-SHA512 per-request signatures using that token. These need their
 * own credentials — the checkout DOKU_CLIENT_ID/DOKU_SECRET_KEY will NOT work
 * here.
 *
 * Exposes createPayout / approvePayout / getPayoutDetails so
 * `src/actions/pencairan.ts` can call it the same way regardless of which
 * disbursement provider is active.
 */

const RAW_PARTNER_ID = (process.env.DOKU_PAYOUT_PARTNER_ID || "").trim();
const RAW_CLIENT_SECRET = (process.env.DOKU_PAYOUT_CLIENT_SECRET || "").trim();
const RAW_PRIVATE_KEY = (process.env.DOKU_PAYOUT_PRIVATE_KEY || "").replace(/\\n/g, "\n").trim();
const CHANNEL_ID = (process.env.DOKU_PAYOUT_CHANNEL_ID || "").trim();
const SOURCE_ACCOUNT_NO = (process.env.DOKU_PAYOUT_ACCOUNT_NO || "").trim();
const IS_PRODUCTION = process.env.DOKU_IS_PRODUCTION === "true";
const DEBUG = process.env.DOKU_PAYOUT_DEBUG === "true";

// Explicit mock flag, or auto-mock whenever the RSA private key isn't
// configured (nothing to sign tokens with — calling the real API would just fail).
const IS_MOCK =
	process.env.DOKU_PAYOUT_MOCK === "true" || !RAW_PRIVATE_KEY || !RAW_PARTNER_ID;

if (IS_MOCK) {
	console.log(
		"------------------------------------------------------------------",
	);
	console.log("⚠️  DOKU PAYOUT MOCK MODE ENABLED ⚠️");
	console.log("Transactions will be simulated. No real money will be moved.");
	console.log(
		"Reason: DOKU_PAYOUT_MOCK=true OR missing DOKU_PAYOUT_PRIVATE_KEY/DOKU_PAYOUT_PARTNER_ID",
	);
	console.log(
		"------------------------------------------------------------------",
	);
}

const BASE_URL = IS_PRODUCTION
	? "https://api.doku.com"
	: "https://api-sandbox.doku.com";

// Indonesian SKN/RTGS bank codes (Bank Indonesia), matching the lowercase
// codes used in src/lib/banks.ts. Add more here as needed — DOKU supports
// 125+ banks, this only covers the ones already selectable in the app.
const BANK_CODE_MAP: Record<string, string> = {
	bri: "002",
	mandiri: "008",
	bni: "009",
	danamon: "011",
	permata: "013",
	bca: "014",
	maybank: "016",
	cimb: "022",
	btn: "200",
	mega: "426",
	bsi: "451",
};

function resolveBankCode(bankName: string): string {
	const key = bankName.trim().toLowerCase();
	const code = BANK_CODE_MAP[key];
	if (!code) {
		throw new Error(
			`Kode bank DOKU untuk "${bankName}" belum dipetakan. Tambahkan di BANK_CODE_MAP (src/lib/doku-payout.ts).`,
		);
	}
	return code;
}

/* ------------------------------------------------------------------------ */
/* Access token (B2B OAuth, RSA-signed, ~15 min validity)                    */
/* ------------------------------------------------------------------------ */

let cachedToken: { token: string; expiresAt: number } | null = null;

function signB2BToken(stringToSign: string): string {
	const signer = createSign("RSA-SHA256");
	signer.update(stringToSign);
	signer.end();
	return signer.sign(RAW_PRIVATE_KEY, "base64");
}

async function getAccessToken(): Promise<string> {
	if (cachedToken && cachedToken.expiresAt > Date.now() + 5000) {
		return cachedToken.token;
	}

	const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
	const stringToSign = `${RAW_PARTNER_ID}|${timestamp}`;
	const signature = signB2BToken(stringToSign);

	const res = await fetch(`${BASE_URL}/authorization/v1/access-token/b2b`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-SIGNATURE": signature,
			"X-TIMESTAMP": timestamp,
			"X-CLIENT-KEY": RAW_PARTNER_ID,
		},
		body: JSON.stringify({ grantType: "client_credentials" }),
	});

	const data = await res.json().catch(() => null);
	if (DEBUG) console.log("[DOKU Payout] token response:", res.status, data);

	if (!res.ok || !data?.accessToken) {
		throw new Error(
			data?.responseMessage || `Gagal mendapatkan access token DOKU Payout (HTTP ${res.status})`,
		);
	}

	const expiresInSec = Number(data.expiresIn) || 900;
	cachedToken = {
		token: data.accessToken as string,
		expiresAt: Date.now() + expiresInSec * 1000,
	};
	return cachedToken.token;
}

/* ------------------------------------------------------------------------ */
/* Per-request SNAP signature (HMAC-SHA512)                                  */
/* ------------------------------------------------------------------------ */

function signRequest(
	method: string,
	endpointUrl: string,
	accessToken: string,
	body: unknown,
	timestamp: string,
): string {
	const minifiedBody = JSON.stringify(body);
	const bodyHash = createHash("sha256").update(minifiedBody).digest("hex").toLowerCase();
	const stringToSign = `${method}:${endpointUrl}:${accessToken}:${bodyHash}:${timestamp}`;
	return createHmac("sha512", RAW_CLIENT_SECRET).update(stringToSign).digest("base64");
}

async function snapPost<T>(path: string, body: unknown): Promise<T> {
	const accessToken = await getAccessToken();
	const timestamp = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
	const externalId = randomUUID().replace(/-/g, "").slice(0, 20);
	const signature = signRequest("POST", path, accessToken, body, timestamp);

	const res = await fetch(`${BASE_URL}${path}`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${accessToken}`,
			"X-SIGNATURE": signature,
			"X-TIMESTAMP": timestamp,
			"X-EXTERNAL-ID": externalId,
			"X-PARTNER-ID": RAW_PARTNER_ID,
			"CHANNEL-ID": CHANNEL_ID,
		},
		body: JSON.stringify(body),
	});

	const data = await res.json().catch(() => null);
	if (DEBUG) console.log(`[DOKU Payout] POST ${path}:`, res.status, data);

	if (!res.ok) {
		throw new Error(
			data?.responseMessage || `DOKU Payout request ke ${path} gagal (HTTP ${res.status})`,
		);
	}
	return data as T;
}

/* ------------------------------------------------------------------------ */
/* Public API                                                                 */
/* ------------------------------------------------------------------------ */

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
	const item = payload.payouts[0];
	if (!item) throw new Error("Payload payout kosong");

	if (IS_MOCK) {
		console.log("[DOKU Payout Mock] createPayout called with:", payload);
		return {
			payouts: [
				{
					status: "processing",
					reference_no: `DOKU-MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
				},
			],
		};
	}

	if (!SOURCE_ACCOUNT_NO) {
		throw new Error("DOKU_PAYOUT_ACCOUNT_NO (rekening sumber dana) belum dikonfigurasi");
	}

	const bankCode = resolveBankCode(item.beneficiary_bank);
	const partnerReferenceNo = `WD${Date.now()}`;

	// 1. Account inquiry — verify the destination account & get a sessionId
	// required by the transfer call.
	const inquiry = await snapPost<{
		sessionId?: string;
		beneficiaryAccountName?: string;
		responseMessage?: string;
	}>("/snap/v1.1/emoney/bank-account-inquiry", {
		partnerReferenceNo,
		customerNumber: SOURCE_ACCOUNT_NO,
		beneficiaryAccountNumber: item.beneficiary_account,
		beneficiaryBankCode: bankCode,
		amount: { value: Number(item.amount).toFixed(2), currency: "IDR" },
	});

	if (!inquiry.sessionId) {
		throw new Error(
			inquiry.responseMessage || "Account inquiry DOKU tidak mengembalikan sessionId",
		);
	}

	// 2. Transfer bank — execute the actual disbursement using that session.
	const transfer = await snapPost<{
		referenceNo?: string;
		responseMessage?: string;
	}>("/snap/v1.1/emoney/transfer-bank", {
		partnerReferenceNo,
		customerNumber: SOURCE_ACCOUNT_NO,
		beneficiaryAccountNumber: item.beneficiary_account,
		beneficiaryBankCode: bankCode,
		amount: { value: Number(item.amount).toFixed(2), currency: "IDR" },
		sessionId: inquiry.sessionId,
		additionalInfo: {
			beneficiaryAccountName: item.beneficiary_name,
			remark: item.notes,
		},
	});

	return {
		payouts: [
			{
				status: "processing",
				reference_no: transfer.referenceNo || partnerReferenceNo,
			},
		],
	};
}

/**
 * DOKU's payout security model is the RSA-signed token itself, not a
 * runtime OTP step — the transfer already executed inside createPayout().
 * This exists only so pencairan.ts's two-call (create → approve) flow
 * still works unchanged.
 */
export async function approvePayout(reference_nos: string[], _otp: string) {
	if (IS_MOCK) {
		console.log("[DOKU Payout Mock] approvePayout no-op for:", reference_nos);
	}
	return { status: "approved", message: "DOKU transfer already executed" };
}

/**
 * NOTE: the exact Check Status endpoint path for Kirim DOKU could not be
 * confirmed from public docs at integration time (see memory note
 * doku-payout-api) — verify against DOKU's Postman collection / support
 * before relying on this for anything user-facing. Not on the critical path
 * of approving a withdrawal; only used for optional status polling.
 */
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
			notes: "Mock transaction (DOKU)",
		};
	}

	const result = await snapPost<{
		latestTransactionStatus?: string;
		amount?: { value?: string };
		transactionDate?: string;
	}>("/snap/v1.1/transfer-inquiry-status", {
		originalPartnerReferenceNo: reference_no,
		serviceCode: "18",
	});

	const statusMap: Record<string, string> = {
		"00": "completed",
		"03": "processing",
		"04": "refunded",
		"06": "failed",
	};

	return {
		reference_no,
		status: statusMap[result.latestTransactionStatus || ""] || "unknown",
		amount: result.amount?.value || "0",
		updated_at: result.transactionDate || new Date().toISOString(),
	};
}
