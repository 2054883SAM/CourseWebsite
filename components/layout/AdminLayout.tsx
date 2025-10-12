'use client';

import React, { ReactNode } from 'react';
// Header component removed to avoid duplication
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { Footer } from './Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
