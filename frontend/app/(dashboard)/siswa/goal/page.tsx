'use client';

import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import StudentGlassDashboard from '@/components/Views/StudentGlassDashboard';
import { getStoredUser, DEFAULT_USER } from '@/lib/api';

export default function SiswaGoalPage() {
  const user = getStoredUser() || DEFAULT_USER;

  return (
    <RoleGuard allowedRoles={['murid', 'admin']}>
      <StudentGlassDashboard currentUser={user} defaultFeature="goal" />
    </RoleGuard>
  );
}
