import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Bell,
  LogOut,
  User,
  Menu,
  ChevronRight,
  Dumbbell,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: Calendar, label: 'My Bookings', href: '/dashboard/my-bookings' },
  { icon: Plus, label: 'Book a Session', href: '/dashboard/bookings' },
  { icon: Bell, label: 'Notifications', href: '/dashboard/notifications' },
];

const ACCOUNT_ITEMS = [
  { icon: User, label: 'Profile Settings', href: '/dashboard/profile-settings' },
];

export default function UserLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchUnread = async () => {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_read', false);
        setUnreadCount(Number(count) || 0);
      };
      fetchUnread();
    }
  }, [user, location.pathname]); // Update on nav change too

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Generate breadcrumbs based on the current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isDashboard = pathParts.length === 1 && pathParts[0] === 'dashboard';

  return (
    <div className="min-h-screen bg-[#111317] flex" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-[#1A1D24] border-r border-border/50 flex flex-col shrink-0 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="p-6 flex items-center justify-between border-b border-border/50 h-16 shrink-0">
          <Link to="/dashboard" className="font-bold text-lg tracking-tight flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
             <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f97316] to-[#ea580c] flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
             </div>
             <span className="text-white">MEMBER</span> <span className="text-[#f97316]">ZONE</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
          <div>
            <div className="space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#f97316]/10 text-[#f97316] font-extrabold shadow-[inset_0_0_20px_rgba(249,115,22,0.05)]' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#f97316]' : 'text-gray-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="px-4 text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4">Account</h3>
            <div className="space-y-1">
              {ACCOUNT_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-[#f97316]/10 text-[#f97316] font-extrabold' 
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-[#f97316]' : 'text-gray-500'}`} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-border/50">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-gray-400 hover:text-red-500 hover:bg-red-500/10 h-12 rounded-xl"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span className="text-sm font-bold">Sign Out</span>
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 shrink-0 bg-[#1A1D24] border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <Link to="/dashboard" className="hover:text-white transition-colors">Member</Link>
              {!isDashboard && pathParts.slice(1).map((part, index) => (
                <React.Fragment key={index}>
                  <ChevronRight className="w-3 h-3 text-gray-700" />
                  <span className="text-white">{part.replace(/-/g, ' ')}</span>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/dashboard/bookings')}
              className="hidden md:flex border-[#f97316]/30 text-[#f97316] hover:bg-[#f97316] hover:text-white text-[10px] font-black uppercase tracking-widest h-9 px-4 rounded-xl"
            >
              <Plus className="w-3.5 h-3.5 mr-2" /> Book Now
            </Button>
            <Link to="/dashboard/notifications" className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-[#1A1D24]" />
              )}
            </Link>
            <Link to="/dashboard/profile-settings">
              <UserAvatar 
                avatarPath={user?.user_metadata?.avatar_url} 
                name={user?.user_metadata?.full_name} 
                className="h-8 w-8 border border-border/50" 
              />
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-6 md:p-8 lg:p-12 max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
