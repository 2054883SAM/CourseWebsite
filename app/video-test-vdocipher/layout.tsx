// app/(video)/layout.tsx — or wherever your video routes are nested
'use client';
import { ReactNode } from 'react';

export default function VdoCipherLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
