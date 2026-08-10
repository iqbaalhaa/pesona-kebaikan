import React from 'react';
import UsersClient from './UsersClient';
import { getUsers, getUserStats, getPendingVerificationCount } from '@/actions/user';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const [userData, stats, pendingVerificationCount] = await Promise.all([
    getUsers(),
    getUserStats(),
    getPendingVerificationCount(),
  ]);

  return (
    <UsersClient
      initialUsers={userData.users}
      initialTotal={userData.total}
      stats={stats}
      initialPendingVerificationCount={pendingVerificationCount}
    />
  );
}
