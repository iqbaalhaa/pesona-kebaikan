import React from "react";
import ReactDOMServer from "react-dom/server";
import CampaignCard from "@/components/common/CampaignCard";
import { normalizeCampaignToCard } from "@/lib/normalizeCampaign";

function assert(condition: any, message: string) {
	if (!condition) {
		throw new Error(message);
	}
}

function log(title: string) {
	console.log(`✓ ${title}`);
}

async function unitTests() {
	const card = normalizeCampaignToCard({
		id: "id1",
		title: null,
		category: null,
		createdBy: { name: "Udin" },
		target: -1000,
		collected: -5,
		daysLeft: -3,
		thumbnail: "",
	});
	assert(card.title === "Tanpa Judul", "fallback title");
	assert(card.category === "Lainnya", "fallback category");
	assert(card.ownerName === "Udin", "owner name mapping");
	assert(card.target === 0 && card.collected === 0 && card.daysLeft === 0, "non-negative numbers");
	assert(card.thumbnail === "/defaultimg.webp", "thumbnail fallback");
	log("normalizeCampaignToCard handles fallbacks and clamps values");
}

async function integrationTests() {
	const data = normalizeCampaignToCard({
		id: "id2",
		slug: "contoh",
		title: "Bantu Sekolah",
		category: "Pendidikan",
		ownerName: "Yayasan A",
		target: 1000000,
		collected: 250000,
		daysLeft: 12,
		thumbnail: "/defaultimg.webp",
	});
	const html = ReactDOMServer.renderToString(
		React.createElement(CampaignCard, { ...data }),
	);
	assert(html.includes("Bantu Sekolah"), "renders title");
	assert(html.includes("Pendidikan"), "renders category");
	log("CampaignCard server-render produces expected markup");
}

async function run() {
	try {
		console.log("Running unit tests...");
		await unitTests();
		console.log("Running integration tests...");
		await integrationTests();
		console.log("All tests passed.");
	} catch (e: any) {
		console.error("Test failed:", e.message);
		process.exit(1);
	}
}

run();

