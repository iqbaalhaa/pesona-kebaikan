"use client";

import * as React from "react";
import { useSession } from "next-auth/react";
import VerificationDialog from "./VerificationDialog";
import { getMyProfile } from "@/actions/user";

type GuardState = {
	verified: boolean;
	pending: boolean;
	loading: boolean;
};

export type VerificationGuardApi = GuardState & {
	/**
	 * Run `onOk` only if the account is verified.
	 * - verified  -> calls onOk()
	 * - pending   -> shows "sedang diproses" snackbar
	 * - otherwise -> opens the verification dialog
	 */
	requireVerified: (onOk: () => void) => void;
};

/**
 * Gates an action behind account verification. Reuses the same
 * VerificationDialog shown in the profile page.
 *
 * Usage (render-prop):
 *   <VerificationGuard>
 *     {({ requireVerified }) => (
 *       <button onClick={() => requireVerified(doProtectedThing)}>...</button>
 *     )}
 *   </VerificationGuard>
 */
export default function VerificationGuard({
	children,
}: {
	children: (api: VerificationGuardApi) => React.ReactNode;
}) {
	const { data: session } = useSession();
	const [state, setState] = React.useState<GuardState>({
		verified: false,
		pending: false,
		loading: true,
	});
	const [openDialog, setOpenDialog] = React.useState(false);

	const refresh = React.useCallback(async () => {
		try {
			const p = (await getMyProfile()) as {
				verifiedAt?: string | Date | null;
				verificationRequests?: { status: string }[];
			} | null;
			const verified = !!p?.verifiedAt;
			const pending =
				!verified && p?.verificationRequests?.[0]?.status === "PENDING";
			setState({ verified, pending: !!pending, loading: false });
		} catch {
			setState((s) => ({ ...s, loading: false }));
		}
	}, []);

	React.useEffect(() => {
		if (session?.user) {
			refresh();
		} else {
			setState({ verified: false, pending: false, loading: false });
		}
	}, [session, refresh]);

	const requireVerified = React.useCallback(
		(onOk: () => void) => {
			if (state.loading) return;
			// Allowed once the user has submitted verification (pending) or is fully approved.
			if (state.verified || state.pending) {
				onOk();
				return;
			}
			setOpenDialog(true);
		},
		[state],
	);

	return (
		<>
			{children({ ...state, requireVerified })}

			<VerificationDialog
				open={openDialog}
				onClose={() => setOpenDialog(false)}
				userEmail={session?.user?.email}
				onSuccess={refresh}
			/>
		</>
	);
}
