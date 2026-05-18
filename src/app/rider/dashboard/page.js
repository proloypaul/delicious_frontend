'use client';

import React, { useState, useEffect } from 'react';
import Loader from '@/components/ui/Loader';
import Notification from '@/components/shared/Notification';

// Import modular sub-components
import RiderSidebar from '@/components/rider/RiderSidebar';
import RiderJobsTab from '@/components/rider/RiderJobsTab';
import RiderActiveTab from '@/components/rider/RiderActiveTab';
import RiderProfileTab from '@/components/rider/RiderProfileTab';

export default function RiderDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('jobs');
  const [notification, setNotification] = useState(null);
  const [riderSession, setRiderSession] = useState(null);

  useEffect(() => {
    setMounted(true);

    // Retrieve active logged-in user session
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          setRiderSession(parsed);
        } catch (e) {
          console.error('Failed to parse user session details', e);
        }
      }
    }
  }, []);

  const showSuccess = (message) => {
    setNotification({ type: 'success', message });
  };

  const showError = (message) => {
    setNotification({ type: 'error', message });
  };

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  // Determine active riderId (fallback to 1 if not logged in for easy public testing)
  const riderId = riderSession?.id || 1;
  const riderName = riderSession?.name || 'Guest Rider';

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col md:flex-row relative">
      
      {/* Toast Alert Banner */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 max-w-sm w-full animate-slide-in-right">
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        </div>
      )}

      {/* Glassmorphic Dark Sidebar Navigation */}
      <RiderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Dashboard Area */}
      <main className="flex-1 p-6 md:p-10 lg:p-12 overflow-y-auto z-10 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Testing / Guest alert banner when using default mock session */}
        {!riderSession && (
          <div className="bg-orange-950/20 border border-orange-900/50 p-4 rounded-2xl flex items-center gap-3 text-orange-400 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping shrink-0"></span>
            Public testing Console: Operating under mock Rider account: "{riderName}" (ID #{riderId}). Register/Login as Rider to sync your profile.
          </div>
        )}

        {/* Dynamic Tab Selector rendering */}
        <div className="animate-fade-in duration-300">
          {activeTab === 'jobs' && (
            <RiderJobsTab 
              riderId={riderId} 
              showSuccess={showSuccess} 
              showError={showError} 
            />
          )}

          {activeTab === 'active' && (
            <RiderActiveTab 
              riderId={riderId} 
              showSuccess={showSuccess} 
              showError={showError} 
            />
          )}

          {activeTab === 'profile' && (
            <RiderProfileTab 
              riderId={riderId} 
              showSuccess={showSuccess} 
              showError={showError} 
            />
          )}
        </div>

      </main>
    </div>
  );
}
