export const SUPPORTED_BANKS = [
	{ code: "bca", name: "BCA" },
	{ code: "mandiri", name: "Mandiri" },
	{ code: "bni", name: "BNI" },
	{ code: "bri", name: "BRI" },
	{ code: "cimb", name: "CIMB Niaga" },
	{ code: "permata", name: "Permata" },
	{ code: "danamon", name: "Danamon" },
	{ code: "btn", name: "BTN" },
	{ code: "bsi", name: "BSI (Bank Syariah Indonesia)" },
	{ code: "maybank", name: "Maybank" },
	{ code: "mega", name: "Bank Mega" },
];

export function getBankName(code: string) {
	return SUPPORTED_BANKS.find((b) => b.code === code)?.name || code;
}
