'use client';

import React from 'react';

export default function AdminDashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {children}
    </div>
  );
}
