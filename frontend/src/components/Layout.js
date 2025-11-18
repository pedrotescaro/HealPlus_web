import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ children, showSidebar = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-x-hidden">
      <div className="fixed inset-0 -z-10 opacity-60 dark:opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[100px] opacity-30 animate-pulse-medium"></div>
      </div>
      <Navbar />
      <div className="flex">
        {showSidebar && <Sidebar />}
        <main className="flex-1 p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
