import { handlers } from "@/auth";

export const GET = async (req: Request) => {
	console.log("Auth GET handler hit:", req.url);
	return handlers.GET(req);
};

export const POST = async (req: Request) => {
	console.log("Auth POST handler hit:", req.url);
	return handlers.POST(req);
};
