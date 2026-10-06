'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import RoleGuard from '@/components/RoleGuard';
import StudentGlassDashboard from '@/components/Views/StudentGlassDashboard';
import TeacherGlassDashboard from '@/components/Views/TeacherGlassDashboard';
import TuGlassDashboard from '@/components/Views/TuGlassDashboard';
import SchoolAdminGlassDashboard from '@/components/Views/SchoolAdminGlassDashboard';
import { getStoredUser, DEFAULT_USER, setStoredUser } from '@/lib/api';

export default function LearnPage() {
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

    if (newRole === 'guru' || newRole === 'murid' || newRole === 'tu' || newRole === 'admin') {
      // Re-renders with updated role in-place
    } else {
      router.push('/');
    }
  };

  return (
    <RoleGuard allowedRoles={['murid', 'admin', 'guru', 'walikelas', 'tu']}>
      {user.role === 'guru' ? (
        <TeacherGlassDashboard
          currentUser={user}
          defaultFeature="learn"
          onSwitchRole={handleSwitchRole}
        />
      ) : user.role === 'admin' ? (
        <SchoolAdminGlassDashboard
          currentUser={user}
          defaultFeature="learn"
          onSwitchRole={handleSwitchRole}
        />
      ) : user.role === 'tu' ? (
        <TuGlassDashboard
          currentUser={user}
          defaultFeature="learn"
          onSwitchRole={handleSwitchRole}
        />
      ) : (
        <StudentGlassDashboard
          currentUser={user}
          defaultFeature="learn"
          onSwitchRole={handleSwitchRole}
        />
      )}
    </RoleGuard>
  );
}
