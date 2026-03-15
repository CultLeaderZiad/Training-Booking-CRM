import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../../components/ui/button';
import { 
  Plus, 
  Calendar, 
  Users, 
  Settings, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Info,
  Filter,
  CheckCircle2,
  UserPlus,
  Settings as SettingsIcon,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { isWithinInterval, startOfDay, endOfDay, subDays, startOfYear, endOfYear } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

type Booking = {
  id: string;
  booking_datetime: string;
  status: string;
  created_at: string;
  profiles: {
    first_name: string;
    last_name: string;
  } | null;
  session_types: {
    name: string;
    base_price: number;
  } | null;
};

type Profile = {
  id: string;
  created_at: string;
  role: string;
  first_name?: string;
  last_name?: string;
};

type Activity = {
  id: string;
  type: 'booking' | 'admin' | 'user';
  label: string;
  description: string;
  timestamp: string;
  is_admin: boolean;
};

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [activityFilter, setActivityFilter] = useState<'all' | 'user' | 'admin'>('all');
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [adminHistory, setAdminHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, profilesRes, historyRes] = await Promise.all([
        supabase
          .from('bookings')
          .select(`
            id,
            booking_datetime,
            status,
            created_at,
            profiles (
              first_name,
              last_name
            ),
            session_types (
              name,
              base_price
            )
          `)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('profiles')
          .select('id, created_at, role, first_name, last_name'),
        (async () => {
          try {
            return await supabase
              .from('session_history')
              .select('*')
              .order('created_at', { ascending: false })
              .limit(30);
          } catch (e) {
            return { data: [] };
          }
        })()
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (profilesRes.error) throw profilesRes.error;

      setBookings(bookingsRes.data as any || []);
      setProfiles(profilesRes.data as any || []);
      setAdminHistory(historyRes?.data || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const { totalRevenue, newClients, activeSessions, pendingRequests } = useMemo(() => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = endOfDay(now);

    switch (dateRange) {
      case 'Today':
        startDate = startOfDay(now);
        break;
      case 'Last 7 Days':
        startDate = startOfDay(subDays(now, 7));
        break;
      case 'Last 30 Days':
        startDate = startOfDay(subDays(now, 30));
        break;
      case 'This Year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfDay(subDays(now, 30));
    }

    // Filter bookings by date range based on booking_datetime or created_at?
    // Using created_at for metrics might make sense, or booking_datetime. Let's use created_at for all except active sessions.
    const bookingsInDateRange = bookings.filter(b => {
      const bDate = new Date(b.created_at);
      return isWithinInterval(bDate, { start: startDate, end: endDate });
    });

    // Calculate metrics based on the filtered set or overall? 
    // Usually metrics are based on the date range.
    const revenue = bookingsInDateRange
      .filter(b => b.status === 'completed' || b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.session_types?.base_price || 0), 0);

    const pending = bookingsInDateRange.filter(b => b.status === 'pending').length;
    
    // Active sessions might be ones scheduled in the future
    const active = bookings.filter(b => b.status === 'confirmed' && new Date(b.booking_datetime) >= now).length;

    const clientsInDateRange = profiles.filter(p => {
      if (!p.created_at || p.role !== 'client') return false;
      const pDate = new Date(p.created_at);
      return isWithinInterval(pDate, { start: startDate, end: endDate });
    }).length;

    return {
      totalRevenue: revenue,
      newClients: clientsInDateRange,
      activeSessions: active,
      pendingRequests: pending
    };
  }, [dateRange, bookings, profiles]);

  const recentActivities = useMemo(() => {
    const activities: Activity[] = [];

    // Map bookings to activity
    bookings.forEach(b => {
      activities.push({
        id: `activity_book_${b.id}`,
        type: 'booking',
        label: b.status === 'cancelled' ? 'Booking Cancelled' : b.status === 'confirmed' ? 'Booking Confirmed' : 'New Booking',
        description: `${b.profiles?.first_name || 'Client'} for ${b.session_types?.name || 'a session'}`,
        timestamp: b.created_at,
        is_admin: false
      });
    });

    // Map new users
    profiles.forEach(p => {
      if (p.role === 'client' || p.role === 'user') {
        activities.push({
          id: `activity_user_${p.id}`,
          type: 'user',
          label: 'New User Joined',
          description: `${p.first_name || 'User'} (${p.role}) registered.`,
          timestamp: p.created_at,
          is_admin: false
        });
      }
    });

    // Map admin history
    adminHistory.forEach((h: any) => {
      activities.push({
        id: `activity_admin_${h.id}`,
        type: 'admin',
        label: `Admin Action: ${h.action}`,
        description: `Modified session ${h.session_id?.split('-')[0] || ''}`,
        timestamp: h.created_at,
        is_admin: true
      });
    });

    // Sort combined activities by timestamp DESC
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply Filter
    let filtered = activities;
    if (activityFilter === 'admin') filtered = activities.filter(a => a.is_admin);
    if (activityFilter === 'user') filtered = activities.filter(a => !a.is_admin);

    return filtered.slice(0, 15); // Show latest 15
  }, [bookings, profiles, adminHistory, activityFilter]);

  return (
    <TooltipProvider delayDuration={300}>
    <div className="p-6 md:p-8 space-y-8">
      
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Overview</h1>
          <p className="text-sm text-gray-400">Welcome to your admin control center. Here is what is happening today.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 border border-[#f97316]/20 shadow-none font-medium h-9">
            <Link to="/admin/sessions">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-none font-medium h-9">
            <Link to="/admin/bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-none font-medium h-9">
            <Link to="/admin/clients">
              <Users className="w-4 h-4 mr-2" />
              Clients
            </Link>
          </Button>
          <Button size="icon" variant="outline" className="h-9 w-9 bg-[#1A1D24] border-border/50 text-gray-400 hover:text-white shrink-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters (Date Range) */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Core Metrics</h2>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-[#1A1D24] border border-border/50 text-white text-xs rounded-md px-3 py-1.5 outline-none focus:border-[#f97316]/50 transition-colors cursor-pointer"
        >
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              Total Revenue
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#111317] border-border/50 text-gray-300">
                  <p>Sum of completed & confirmed session base prices</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <span className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">£{totalRevenue.toFixed(2)}</p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              New Clients
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#111317] border-border/50 text-gray-300">
                  <p>Count of client registrations within range</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">{newClients}</p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              Upcoming Sessions
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#111317] border-border/50 text-gray-300">
                  <p>Number of your confirmed future bookings</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <span className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">{activeSessions}</p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              Pending Requests
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-gray-500 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="bg-[#111317] border-border/50 text-gray-300">
                  <p>Bookings awaiting admin approval</p>
                </TooltipContent>
              </Tooltip>
            </h3>
            <span className="p-2 bg-[#f97316]/10 rounded-lg text-[#f97316]">
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">{pendingRequests}</p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-[#f97316]/5 rounded-full blur-2xl group-hover:bg-[#f97316]/10 transition-colors"></div>
        </div>

      </div>

      {/* Quick Panels */}
      <div className="grid gap-6 lg:grid-cols-2 pt-4">
        
        {/* Recent Activity List */}
        <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-black/10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-[#f97316] rounded-full"></div>
              <h2 className="text-base font-bold text-white tracking-wide">Recent Activity</h2>
            </div>
            
            <select 
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value as any)}
              className="bg-[#111317] border border-border/50 text-gray-300 text-xs rounded-md px-2 py-1 outline-none focus:border-[#f97316]/50 transition-colors"
            >
              <option value="all">All Activity</option>
              <option value="user">User Action</option>
              <option value="admin">Admin Action</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">Loading...</div>
             ) : recentActivities.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">No recent activity matching the filter.</div>
             ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-white/5 hover:bg-white/10 transition-colors group">
                     <div className="flex items-start gap-4">
                       <div className={`mt-0.5 p-1.5 rounded bg-black/20 border border-white/5 ${activity.is_admin ? 'text-purple-400' : 'text-[#f97316]'}`}>
                          {activity.type === 'admin' ? <SettingsIcon className="w-4 h-4" /> : 
                           activity.type === 'user' ? <UserPlus className="w-4 h-4" /> : 
                           <Calendar className="w-4 h-4" />}
                       </div>
                       <div>
                         <p className="text-sm font-medium text-white mb-0.5">
                           {activity.label}
                         </p>
                         <p className="text-xs text-gray-400">
                           {activity.description}
                         </p>
                       </div>
                     </div>
                     <span className="text-[10px] text-gray-500 whitespace-nowrap">
                       {new Date(activity.timestamp).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'})}
                     </span>
                  </div>
                ))
             )}
          </div>
        </div>
        
        {/* Quick System Logs */}
        <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-border/50 flex items-center gap-3 bg-black/10">
            <div className="w-1.5 h-4 bg-gray-600 rounded-full"></div>
            <h2 className="text-base font-bold text-white tracking-wide">System Logs</h2>
          </div>
          <div className="flex-1 bg-[#111317]/80 p-5 text-xs font-mono text-gray-400 overflow-y-auto">
            <div className="space-y-3">
              <p><span className="text-green-500 mr-2">[SYSTEM]</span> Data synced successfully at {new Date().toLocaleTimeString()}</p>
              <p><span className="text-blue-500 mr-2">[AUTH]</span> Admin session active</p>
              <p><span className="text-purple-500 mr-2">[API]</span> Fetched {bookings.length} total bookings</p>
              {pendingRequests > 0 && (
                <p><span className="text-yellow-500 mr-2">[ALERT]</span> {pendingRequests} bookings await your approval.</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
    </TooltipProvider>
  );
}

