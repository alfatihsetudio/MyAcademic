'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getStoredUser } from '@/lib/api';

export default function RoleGuard({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: string[] }) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const user = getStoredUser();
    if (!user) {
      router.push('/login');
    } else if (!allowedRoles.includes(user.role)) {
      router.push('/');
    } else {
      setIsAuthorized(true);
    }
  }, [router, allowedRoles]);

  if (!isAuthorized) {
    return <div className="p-8 text-center text-slate-500">Loading or Unauthorized...</div>;
  }

  return <>{children}</>;
}
