"use client";

import { handleSignOut } from "./signin-action";
import { Button } from "@mui/material";

export function SignOutButton() {
  return (
    <form action={handleSignOut}>
      <Button type="submit" variant="outlined" color="error">
        Sign Out
      </Button>
    </form>
  );
}
