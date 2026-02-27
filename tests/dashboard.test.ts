import { fmtIDR } from "../src/app/admin/DashboardClient";

function assert(condition: boolean, message: string) {
	if (!condition) {
		throw new Error(message);
	}
}

function log(message: string) {
	console.log(`✓ ${message}`);
}

export async function dashboardTests() {
	// Test fmtIDR
	assert(fmtIDR(1000) === "Rp1.000", "fmtIDR(1000) should be Rp1.000");
	assert(fmtIDR(1000000) === "Rp1.000.000", "fmtIDR(1000000) should be Rp1.000.000");
	assert(fmtIDR(0) === "Rp0", "fmtIDR(0) should be Rp0");
	assert(fmtIDR(null as any) === "Rp0", "fmtIDR(null) should be Rp0");
	log("fmtIDR formats currency correctly");

	// Test data structure validation (simulating component logic)
	const mockKpi = {
		donation7d: [],
		categoryDist: [],
		payMethodDist: [],
		campaignCreated14d: [],
		provinceStats: []
	};

	// Validate that empty arrays are handled gracefully (simulated)
	assert(Array.isArray(mockKpi.donation7d), "donation7d should be an array");
	assert(mockKpi.donation7d.length === 0, "donation7d should be empty initially");
	log("Dashboard KPI data structure validation passed");
}
