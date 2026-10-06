import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-transparent transition-colors duration-300">{children}</div>;
}
