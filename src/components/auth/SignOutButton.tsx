"use client";

import { signOut } from "@/auth";
import { Button } from "@mui/material";

export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <Button type="submit" variant="outlined" color="error">
        Sign Out
      </Button>
    </form>
  );
}
