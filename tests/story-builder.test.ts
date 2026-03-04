import React from "react";
import ReactDOMServer from "react-dom/server";
import StoryBuilder from "@/components/campaign/create/StoryBuilder";

function assert(condition: any, message: string) {
	if (!condition) {
		throw new Error(message);
	}
}

function log(title: string) {
	console.log(`✓ ${title}`);
}

async function run() {
	try {
		console.log("Running StoryBuilder tests...");

		const html = ReactDOMServer.renderToString(
			React.createElement(StoryBuilder, {
				category: "sakit",
				onComplete: () => {},
				onBack: () => {},
			}),
		);

		// Check for autocomplete="off"
		// React might render it as autocomplete="off" (lowercase) in HTML
		// Or it might be on the input element inside the div
		console.log(html);
		assert(
			html.includes('autocomplete="off"'),
			'TextField has autocomplete="off"',
		);

		log("StoryBuilder renders with autocomplete disabled");
	} catch (e: any) {
		console.error("Test failed:", e.message);
		process.exit(1);
	}
}

run();
