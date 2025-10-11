'use client';

import React from 'react';
import { StudentSidebar } from './StudentSidebar';

interface StudentLayoutProps {
  children: React.ReactNode;
}

export function StudentLayout({ children }: StudentLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      <div className="flex-shrink-0">
        <StudentSidebar />
      </div>
      <main className="flex-1 overflow-x-hidden lg:mt-0 mt-20">{children}</main>
    </div>
  );
}
