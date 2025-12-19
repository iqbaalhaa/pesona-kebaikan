import { NextResponse } from "next/server";
import { donationService } from "@/services/donationService";

export async function GET() {
	try {
		const donations = await donationService.getAll();
		return NextResponse.json({ success: true, data: donations });
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, error: "Failed to fetch donations" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	try {
		const body = await request.json();
		// In a real app, you would validate the body here (e.g., using Zod)

		const newDonation = await donationService.create(body);
		return NextResponse.json(
			{ success: true, data: newDonation },
			{ status: 201 }
		);
	} catch (error) {
		console.error(error);
		return NextResponse.json(
			{ success: false, error: "Failed to create donation" },
			{ status: 500 }
		);
	}
}
