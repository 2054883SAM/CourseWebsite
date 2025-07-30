'use client';

import React from 'react';
import { withAuth } from '@/components/auth/withAuth';

// Wrap the course player layout with authentication protection
function CoursePlayerLayout({ children }: { children: React.ReactNode }) {
  return children;
}

// Export the authenticated layout component
export default withAuth(CoursePlayerLayout, { requiredRole: 'student' }); 