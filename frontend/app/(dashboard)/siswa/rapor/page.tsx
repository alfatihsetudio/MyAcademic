'use client';

import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import StudentHubView from '@/components/Views/StudentHubView';
import { getStoredUser, DEFAULT_USER } from '@/lib/api';

export default function RaporSiswaPage() {
  const user = getStoredUser() || DEFAULT_USER;

  return (
    <RoleGuard allowedRoles={['murid', 'admin']}>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <StudentHubView currentUser={user} initialFeatureId="grades" />
      </div>
    </RoleGuard>
  );
}
