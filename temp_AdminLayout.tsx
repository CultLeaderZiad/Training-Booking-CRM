import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UserAvatar } from './UserAvatar';
import { Button } from './ui/button';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  BookOpen, 
  Menu, 
  X,
  LogOut,
  Bell,
  ChevronRight,
  ShieldCheck,
  User,
  Plus,
  Briefcase
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
  { icon: Calendar, label: 'Sessions', href: '/admin/sessions' },
  { icon: Users, label: 'Clients', href: '/admin/clients' },
  { icon: BookOpen, label: 'Bookings', href: '/admin/bookings' },
];

export default function AdminLayout() {
  const { user, signOut, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  React.useEffect(() => {
    // 1. Fetch initial mock or unread DB notifications here if needed

    // 2. Set up Supabase Realtime listener for NEW bookings
    const bookingsSub = supabase
      .channel('admin-bookings-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bookings' },
        (payload) => {
          toast.success('New Booking Received!');
          const newNotif = {
            id: payload.new.id || Math.random(),
            title: 'New Booking Request',
            message: 'A client just submitted a new booking.',
            created_at: payload.new.created_at || new Date().toISOString(),
            is_read: false
          };
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    // 3. Set up listener for NEW profiles (sign ups)
    const profilesSub = supabase
      .channel('admin-profiles-listener')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'profiles' },
        (payload) => {
          toast.success('New Client Joined!');
          const newNotif = {
            id: payload.new.id || Math.random(),
            title: 'New Client Sign-up',
            message: `${payload.new.first_name || 'A new user'} just joined the platform.`,
            created_at: payload.new.created_at || new Date().toISOString(),
            is_read: false
          };
          setNotifications((prev) => [newNotif, ...prev]);
          setUnreadCount((prev) => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsSub);
      supabase.removeChannel(profilesSub);
    };
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const markAllAsRead = () => {
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({...n, is_read: true})));
  };

  // Generate breadcrumbs based on the current path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isOverview = pathParts.length === 1 && pathParts[0] === 'admin';

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
          <Link to="/admin" className="font-bold text-lg tracking-tight flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            <span className="text-white">DEV</span> <span className="text-[#f97316]">ADMIN</span>
          </Link>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== '/admin');
            
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-[#f97316]/10 text-[#f97316] font-medium' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-[#f97316]' : 'text-gray-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
        
        <div className="p-4 border-t border-border/50">
          <div className="bg-black/20 rounded-lg p-4 flex items-center justify-between">
             <div className="flex flex-col">
               <span className="text-xs font-semibold text-gray-300">System Status</span>
               <span className="text-[10px] text-green-500 flex items-center gap-1 mt-1">
                 <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                 Operational
               </span>
             </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content (Header + Outlet) */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Header */}
        <header className="h-16 shrink-0 bg-[#1A1D24] border-b border-border/50 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          
          {/* Mobile Menu & Breadcrumbs */}
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="hidden sm:flex flex-wrap items-center gap-2 text-xs font-medium text-gray-400">
              <Link to="/admin" className="hover:text-white transition-colors">Admin</Link>
              {!isOverview && pathParts.map((part, index) => {
                if (index === 0 && part === 'admin') return null; // Skip 'admin'
                const isLast = index === pathParts.length - 1;
                const path = '/' + pathParts.slice(0, index + 1).join('/');
                
                return (
                  <React.Fragment key={path}>
                    <ChevronRight className="w-3.5 h-3.5 text-gray-600 shrink-0" />
                    {isLast ? (
                      <span className="text-white capitalize truncate">{part.replace(/-/g, ' ')}</span>
                    ) : (
                      <Link to={path} className="hover:text-white transition-colors capitalize truncate">{part.replace(/-/g, ' ')}</Link>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3 shrink-0 pl-4">
            
            {/* Quick Action */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden sm:flex bg-[#f97316] hover:bg-[#ea580c] text-white font-medium border-0 ring-0 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Quick Action
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48 border-border/50 bg-[#1A1D24]" align="end">
                <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                  <Link to="/admin/sessions" className="w-full flex items-center text-gray-300 hover:text-white">
                    <Calendar className="w-4 h-4 mr-2 text-blue-400" />
                    <span>New Session</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                  <Link to="/admin/clients" className="w-full flex items-center text-gray-300 hover:text-white">
                    <Users className="w-4 h-4 mr-2 text-green-400" />
                    <span>Add Client</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-not-allowed opacity-50">
                  <div className="w-full flex items-center text-gray-300">
                    <Briefcase className="w-4 h-4 mr-2 text-orange-400" />
                    <span>Manual Booking</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5 outline-none">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-3 w-3 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white border-2 border-[#1A1D24]">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80 border-border/50 bg-[#1A1D24] p-0" align="end">
                 <div className="p-4 border-b border-border/50 flex justify-between items-center">
                    <span className="font-semibold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-0.5 rounded-full font-medium">{unreadCount} Unread</span>
                    )}
                 </div>
                 <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 text-xs">No new notifications</div>
                    ) : (
                      notifications.map((notif: any) => (
                        <div key={notif.id} className={`p-3 rounded-md transition-colors cursor-pointer border-l-2 ${notif.is_read ? 'bg-transparent border-transparent text-gray-400 hover:bg-white/5' : 'bg-white/5 border-[#f97316] hover:bg-white/10'}`}>
                           <p className={`text-xs font-medium mb-1 ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</p>
                           <p className="text-[11px] text-gray-400">{notif.message}</p>
                           <p className="text-[9px] text-gray-600 mt-2">
                             {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                           </p>
                        </div>
                      ))
                    )}
                 </div>
                 <div className="p-2 border-t border-border/50 text-center">
                    <button onClick={markAllAsRead} className="text-xs text-[#f97316] hover:text-[#ea580c] font-medium p-2 w-full">Mark all as read</button>
                 </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 cursor-pointer p-1 rounded-full hover:bg-white/5 transition-colors">
                  <UserAvatar 
                    avatarPath={user?.user_metadata?.avatar_url} 
                    name={user?.user_metadata?.full_name} 
                    email={user?.email} 
                    className="h-8 w-8 border border-border/50" 
                  />
                  <div className="hidden md:flex flex-col items-start pr-2">
                    <span className="text-sm font-semibold text-white leading-none mb-1">
                      {user?.user_metadata?.full_name || 'Admin User'}
                    </span>
                    <span className="text-[10px] text-[#f97316] font-bold uppercase tracking-widest leading-none">
                      {role || 'ADMIN'}
                    </span>
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 border-border/50 bg-[#1A1D24]" align="end" forceMount>
                <DropdownMenuItem asChild className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">
                  <Link to="/profile" className="w-full flex items-center text-gray-300 hover:text-white">
                    <User className="w-4 h-4 mr-2" />
                    <span>My Profile</span>
                  </Link>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
