import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Search,
  ChevronRight,
  TrendingUp,
  Dumbbell
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { format, isValid, parseISO } from 'date-fns';

export default function UserDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedSessions: 0,
    activeBookings: 0
  });
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 1. Fetch User Bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('*, sessions(*, session_types(*))')
        .eq('user_id', user?.id)
        .filter('status', 'neq', 'cancelled')
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Filter out bookings where the related session data is null
      const validBookings = (bookingsData || []).filter(b => b.sessions !== null);

      const confirmed = validBookings.filter(b => b.status === 'confirmed' || b.status === 'completed');
      const now = new Date();
      
      const completed = confirmed.filter(b => {
        if (b.status === 'completed') return true;
        const endTime = b.sessions?.end_time ? new Date(b.sessions.end_time) : null;
        return endTime && isValid(endTime) && endTime < now;
      }).length;

      const active = validBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

      setStats({
        completedSessions: completed,
        activeBookings: active
      });

      // Fetch only upcoming confirmed sessions for the schedule preview
      const upcoming = (bookingsData || [])
        .filter(b => b.sessions && (b.status === 'confirmed' || b.status === 'pending') && (new Date(b.sessions.start_time) > now))
        .slice(0, 3);
      
      setUpcomingSessions(upcoming);

    } catch (error: any) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const safeFormat = (dateStr: string, formatStr: string) => {
    if (!dateStr) return '---';
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, formatStr) : '---';
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* Hero Section */}
      <section className="bg-[#1A1D24] border border-border/50 rounded-[40px] p-10 md:p-16 relative overflow-hidden">
         <div className="absolute top-0 right-0 w-1/2 h-full bg-[#f97316]/5 blur-[120px] rounded-full translate-x-1/4 -translate-y-1/4" />
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl space-y-4">
                <div className="space-y-1">
                   <h1 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-[0.9]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                     {getTimeOfDayGreeting()}, <br/>
                     <span className="text-[#f97316] uppercase">{user?.user_metadata?.full_name?.split(' ')[0] || 'Member'}</span>
                   </h1>
                   {upcomingSessions.length > 0 && upcomingSessions[0].sessions && (
                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">Next Training: <span className="text-white">{safeFormat(upcomingSessions[0].sessions.start_time, 'EEEE, MMM d @ HH:mm')}</span></p>
                   )}
                </div>

                <p className="text-gray-500 text-lg font-medium pt-4">
                  {stats.activeBookings > 0 
                    ? `You have ${stats.activeBookings} active bookings. Keep up the great work!` 
                    : "No sessions booked yet? Let's get you back on track today."}
                </p>
            </div>

            <Button 
               onClick={() => navigate('/dashboard/bookings')}
               className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#f97316]/20 shrink-0"
            >
               Book Now
            </Button>
         </div>
      </section>

      {/* Modern Metrics Grid */}
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-[#1A1D24] border border-border/50 rounded-3xl p-8 flex items-center gap-6 group hover:border-[#f97316]/30 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-[0_0_20px_rgba(34,197,94,0.1)]">
               <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Sessions Completed</p>
               <p className="text-4xl font-black text-white">{stats.completedSessions}</p>
            </div>
         </div>

         <div className="bg-[#1A1D24] border border-border/50 rounded-3xl p-8 flex items-center gap-6 group hover:border-[#f97316]/30 transition-all">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]">
               <Calendar className="w-8 h-8" />
            </div>
            <div>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Active Bookings</p>
               <p className="text-4xl font-black text-white">{stats.activeBookings}</p>
            </div>
         </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-1 h-6 bg-[#f97316] rounded-full" />
               <h2 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Upcoming Sessions</h2>
            </div>
            <Button 
               variant="ghost" 
               onClick={() => navigate('/dashboard/bookings')}
               className="text-[10px] font-black uppercase tracking-widest text-[#f97316] hover:bg-[#f97316]/10"
            >
               Book Now <ChevronRight className="w-3 h-3 ml-1" />
            </Button>
         </div>

         {loading ? (
            <div className="grid gap-4">
               {[1, 2].map(i => <div key={i} className="h-24 rounded-3xl bg-[#1A1D24] animate-pulse border border-border/50" />)}
            </div>
         ) : upcomingSessions.length > 0 ? (
            <div className="grid gap-4">
               {upcomingSessions.map((booking) => (
                  <div key={booking.id} className="bg-[#1A1D24] border border-border/50 rounded-3xl p-6 flex items-center gap-6 group hover:bg-white/[0.02] transition-all">
                     <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center">
                        <span className="text-[10px] font-black text-gray-500 uppercase leading-none">
                          {booking.sessions?.start_time ? format(new Date(booking.sessions.start_time), 'MMM') : '---'}
                        </span>
                        <span className="text-xl font-black text-white leading-none mt-1">
                          {booking.sessions?.start_time ? format(new Date(booking.sessions.start_time), 'd') : '?'}
                        </span>
                     </div>
                     <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-white uppercase tracking-tight truncate">{booking.sessions?.title || 'Session'}</h4>
                        <div className="flex items-center gap-4 mt-1">
                           <span className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                              <Clock className="w-3.5 h-3.5 text-[#f97316]" /> 
                              {booking.sessions?.start_time ? format(new Date(booking.sessions.start_time), 'HH:mm') : 'TBD'}
                           </span>
                           <Badge className="bg-[#f97316]/10 text-[#f97316] border-none text-[8px] font-black uppercase">{booking.sessions?.session_types?.name}</Badge>
                        </div>
                     </div>
                     <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                  </div>
               ))}
            </div>
         ) : (
            <div className="bg-[#1A1D24] border border-border/50 rounded-[40px] p-16 text-center space-y-6">
               <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center mx-auto border border-white/5 text-gray-600">
                  <Calendar className="w-8 h-8" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">Your training starts here</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">Browse our weekly schedule and find the perfect session to hit your goals.</p>
               </div>
               <Button 
                onClick={() => navigate('/dashboard/bookings')}
                className="bg-[#f97316] hover:bg-[#ea580c] text-white px-8 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#f97316]/20"
               >
                  Book Your First Session
               </Button>
            </div>
         )}
      </div>

      {/* Motivational & Help Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#f97316] to-[#ea580c] rounded-[40px] p-10 relative overflow-hidden group">
           <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 blur-3xl rounded-full group-hover:scale-110 transition-transform duration-700" />
           <div className="relative z-10 flex flex-col items-center justify-between h-full gap-8 text-center md:text-left">
              <div className="space-y-2 w-full">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">New Level Unlocked?</h3>
                 <p className="text-white/80 text-sm font-medium">Keep your streak alive. Members who train at least 3x a week see 4x faster results.</p>
              </div>
              <Button 
                onClick={() => navigate('/dashboard/bookings')}
                className="bg-white text-[#f97316] hover:bg-white/90 px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] w-full md:w-auto"
              >
                 Browse Schedule
              </Button>
           </div>
        </div>

        <div className="bg-[#1A1D24] border border-border/50 rounded-[40px] p-10 relative overflow-hidden group hover:border-[#f97316]/30 transition-all">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#f97316]/5 blur-3xl rounded-full" />
           <div className="relative z-10 flex flex-col items-center justify-between h-full gap-8 text-center md:text-left">
              <div className="space-y-2 w-full">
                 <h3 className="text-2xl font-black text-white uppercase tracking-tight">Need Help?</h3>
                 <p className="text-gray-400 text-sm font-medium">Have questions about your training or booking? Chat with our AI coach right now.</p>
              </div>
              <Button 
                onClick={() => (window as any).voiceflow?.chat?.open()}
                className="bg-[#1A1D24] border border-[#f97316] text-[#f97316] hover:bg-[#f97316] hover:text-white px-8 h-14 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] w-full md:w-auto transition-all"
              >
                 Open Chatbot
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
