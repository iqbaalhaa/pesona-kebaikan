import { attributionFromLanding, classifySource, isBotUserAgent, parseAttributionCookie, withShareUtm } from "../src/lib/tracking-source";
import { buildPurchaseEvent, normalizePhone, sha256 } from "../src/lib/meta-capi";
import { activeCampaignPixelId, parseTrackingSettings } from "../src/lib/tracking-settings";

function assert(condition: unknown, message: string) {
	if (!condition) throw new Error(message);
}

function log(message: string) {
	console.log(`✓ ${message}`);
}

export async function trackingTests() {
	assert(classifySource({ utmSource: "FB" }) === "facebook", "utm fb → facebook");
	assert(classifySource({ utmSource: "ig_story" }) === "instagram", "utm ig → instagram");
	assert(classifySource({ utmSource: "wa" }) === "whatsapp", "utm wa → whatsapp");
	assert(classifySource({ utmSource: "Koran Lokal!" }) === "koranlokal", "unknown utm kept, sanitized");
	assert(classifySource({ fbclid: "abc" }) === "facebook", "fbclid → facebook");
	assert(classifySource({ referrer: "https://l.instagram.com/x" }) === "instagram", "ig referrer");
	assert(classifySource({ referrer: "https://www.google.co.id/" }) === "google", "google referrer");
	assert(classifySource({ referrer: "https://blog.example.org/a" }) === "referral", "other site → referral");
	assert(
		classifySource({ referrer: "https://pesonakebaikan.com/x", selfHost: "pesonakebaikan.com" }) === "direct",
		"own site → direct",
	);
	assert(classifySource({}) === "direct", "nothing → direct");
	log("classifySource maps utm/fbclid/referrer to sources");

	const landing = attributionFromLanding(
		new URL("https://pesonakebaikan.com/donasi/a?utm_source=facebook&utm_campaign=ramadhan&utm_content=video1&fbclid=XYZ"),
		"",
	);
	assert(landing?.source === "facebook" && landing.utmCampaign === "ramadhan" && landing.utmContent === "video1", "landing utm");
	assert(attributionFromLanding(new URL("https://pesonakebaikan.com/"), "") === null, "direct landing keeps old cookie");
	const round = parseAttributionCookie(encodeURIComponent(JSON.stringify(landing)));
	assert(round.utmCampaign === "ramadhan" && round.fbclid === "XYZ", "cookie round trip");
	assert(parseAttributionCookie("%%bad").source === "direct", "bad cookie → direct");
	log("attribution cookie parse/write");

	const shared = withShareUtm("https://pesonakebaikan.com/donasi/a?x=1", "whatsapp");
	assert(shared === "https://pesonakebaikan.com/donasi/a?x=1&utm_source=whatsapp&utm_medium=share", "share utm appended");
	assert(withShareUtm("/donasi/a", "copy") === "/donasi/a", "relative url left as is");
	assert(attributionFromLanding(new URL(shared), "")?.source === "whatsapp", "shared link → whatsapp source");
	assert(classifySource({ utmSource: "share" }) === "share", "native share source kept");
	log("share links carry utm_source");

	assert(isBotUserAgent("facebookexternalhit/1.1"), "fb crawler is bot");
	assert(isBotUserAgent(""), "empty UA is bot");
	assert(!isBotUserAgent("Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"), "phone browser not bot");
	log("bot user agents filtered");

	assert(normalizePhone("0812-3456-7890") === "6281234567890", "0812 → 62812");
	assert(normalizePhone("+62 812 3456 7890") === "6281234567890", "+62 kept");
	assert(normalizePhone("81234567890") === "6281234567890", "8xx → 628xx");
	assert(normalizePhone("123") === null, "too short → null");
	const ev = buildPurchaseEvent({
		donationId: "don1",
		amount: 50000,
		campaignId: "c1",
		sourceUrl: "https://pesonakebaikan.com/donasi/a",
		phone: "081234567890",
		email: " A@B.com ",
		tracking: { fbp: "fb.1.1.2", ip: "1.2.3.4", ua: "UA" },
		eventTime: 100,
	}) as any;
	assert(ev.event_id === "don1" && ev.event_name === "Purchase", "event id = donation id");
	assert(ev.user_data.ph[0] === sha256("6281234567890"), "phone hashed after normalize");
	assert(ev.user_data.em[0] === sha256("a@b.com"), "email trimmed+lowercased+hashed");
	assert(ev.user_data.fbp === "fb.1.1.2" && ev.user_data.client_ip_address === "1.2.3.4", "fbp/ip passed raw");
	assert(ev.custom_data.value === 50000 && ev.custom_data.currency === "IDR", "value/currency");
	assert(!JSON.stringify(ev).includes("081234567890"), "no raw phone in payload");
	log("buildPurchaseEvent hashes PII and dedups by donation id");

	const s = parseTrackingSettings({});
	assert(!s.pixelEnabled && s.statsEnabled && s.ownerPixelEnabled && s.viewDedupMinutes === 30, "defaults");
	const on = parseTrackingSettings({ meta_pixel_enabled: "true", meta_pixel_id: "abc" });
	assert(!on.pixelEnabled, "invalid pixel id keeps pixel off");
	const ok = parseTrackingSettings({ meta_pixel_enabled: "true", meta_pixel_id: "123456789012345" });
	assert(ok.pixelEnabled, "valid pixel id on");
	assert(activeCampaignPixelId({ metaPixelId: "123456789012345", metaPixelDisabled: false }, ok) === "123456789012345", "owner pixel on");
	assert(activeCampaignPixelId({ metaPixelId: "123456789012345", metaPixelDisabled: true }, ok) === null, "admin-disabled pixel off");
	assert(
		activeCampaignPixelId(
			{ metaPixelId: "123456789012345", metaPixelDisabled: false },
			parseTrackingSettings({ meta_owner_pixel_enabled: "false" }),
		) === null,
		"global owner-pixel switch off",
	);
	log("tracking settings defaults and owner pixel rules");
}
