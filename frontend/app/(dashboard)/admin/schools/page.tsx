'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import SchoolAdminGlassDashboard from '@/components/Views/SchoolAdminGlassDashboard';
import { getStoredUser, DEFAULT_USER, setStoredUser } from '@/lib/api';

export default function SchoolsPage() {
  const router = useRouter();
  const [user, setUser] = useState(getStoredUser() || DEFAULT_USER);

  const handleSwitchRole = (newRole: string) => {
    let name = 'Ahmad Siswa';
    if (newRole === 'superadmin') name = 'Super Admin (Platform Owner)';
    else if (newRole === 'admin') name = 'Hendra Pratama, S.Kom (Admin Sekolah)';
    else if (newRole === 'kepsek') name = 'Dr. H. Sulaiman, M.Si (Kepsek)';
    else if (newRole === 'guru') name = 'Budi Santoso, M.Pd (Guru)';
    else if (newRole === 'walikelas') name = 'Siti Aminah, M.Pd (Wali Kelas)';
    else if (newRole === 'bk') name = 'Nurul Hidayah, S.Psi (Konselor BK)';
    else if (newRole === 'tu') name = 'Hendra Pratama (Staff TU)';
    else if (newRole === 'parent') name = 'Bambang Trianto (Wali Murid)';

    const updated = {
      ...user,
      role: newRole,
      name,
    };
    setUser(updated);
    setStoredUser(updated);

    if (newRole === 'admin') {
      // stay in place
    } else {
      router.push('/');
    }
  };

  return (
    <RoleGuard allowedRoles={['admin', 'tu', 'kepsek', 'superadmin']}>
      <SchoolAdminGlassDashboard
        currentUser={user}
        defaultFeature="profile"
        onSwitchRole={handleSwitchRole}
      />
    </RoleGuard>
  );
}
