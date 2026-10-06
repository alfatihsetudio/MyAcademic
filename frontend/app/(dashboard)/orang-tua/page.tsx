'use client';

import React from 'react';
import RoleGuard from '@/components/RoleGuard';
import ParentPortalView from '@/components/Views/ParentPortalView';

export default function OrangTuaMasterPage() {
  return (
    <RoleGuard allowedRoles={['parent', 'orang_tua', 'wali', 'admin']}>
      <div className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <ParentPortalView />
      </div>
    </RoleGuard>
  );
}
