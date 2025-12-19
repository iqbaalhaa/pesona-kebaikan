"use client";

import { Button } from "@mui/material";
import { handleSignIn } from "./signin-action";

export function SignInButton() {
  return (
    <form action={handleSignIn} className="w-full">
      <Button type="submit" variant="contained" fullWidth size="large" className="mt-4">
        Sign in with GitHub
      </Button>
    </form>
  );
}
