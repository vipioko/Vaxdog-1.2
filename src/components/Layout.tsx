import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';

const Layout: React.FC = () => {
  const location = useLocation();
  const noNavRoutes = ['/'];

  const showNav = !noNavRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <Outlet />
      </main>
      {showNav && <BottomNav />}
    </div>
  );
};

export default Layout;