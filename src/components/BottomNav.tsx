import { Link, useLocation } from 'react-router-dom';
import { Bell, User, Heart, Home, Calendar, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/dashboard', label: 'Bookings', icon: Calendar },
  { href: '/shop', label: 'Shop', icon: ShoppingBag },
  { href: '/my-orders', label: 'Orders', icon: Bell },
  { href: '/profile', label: 'Profile', icon: User },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 shadow-lg">
      <div className="flex justify-around max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href === '/home' && location.pathname === '/') ||
            (item.href === '/dashboard' && (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/my-dogs')));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full pt-3 pb-2 text-xs font-medium transition-all duration-200 rounded-t-lg mx-1 relative',
                isActive
                  ? 'text-purple-400'
                  : 'text-slate-400 hover:text-purple-300'
              )}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-purple-400 rounded-full"></div>
              )}
              <div className={cn(
                'p-2 rounded-xl transition-all duration-200',
                isActive ? 'bg-purple-500/20' : 'hover:bg-slate-800/50'
              )}>
                <item.icon className="h-5 w-5" />
              </div>
              <span className="mt-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;