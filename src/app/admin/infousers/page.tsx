import React from "react";
import { auth } from "@/auth";
import { getInfoUsersStats } from "@/actions/infousers";
import InfoUsersClient from "./InfoUsersClient";

export default async function InfoUsersPage() {
  const session = await auth();
  const stats = await getInfoUsersStats();
  return <InfoUsersClient session={session} stats={stats} />;
}

