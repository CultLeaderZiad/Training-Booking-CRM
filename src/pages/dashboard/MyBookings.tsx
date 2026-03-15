import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format, parseISO, isValid, startOfWeek, addDays, isSameDay } from 'date-fns';
import { Badge } from '../../components/ui/badge';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronRight, 
  XCircle,
  Layout,
  Grid,
  ChevronLeft,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/button';

export default function MyBookings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    if (user) fetchBookings();
  }, [user]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*, sessions(*, session_types(*)), session_types(*)')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);
      if (error) throw error;
      toast.success('Booking cancelled.');
      fetchBookings();
    } catch (error: any) {
      toast.error('Cancel failed: ' + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      confirmed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
      completed: "bg-blue-500/10 text-blue-500 border-blue-500/20"
    };
    return <Badge className={`text-[8px] font-black uppercase tracking-widest ${styles[status] || styles.pending}`}>{status}</Badge>;
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
           <h1 className="text-4xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Training Schedule</h1>
           <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Manage your training history and upcoming sessions.</p>
        </div>

        <div className="flex items-center gap-4">
           {view === 'calendar' && (
             <div className="flex items-center bg-black/20 rounded-xl border border-white/5 p-1">
               <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="text-gray-400 hover:text-white h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
               </Button>
               <span className="text-[10px] font-black text-white px-4 uppercase tracking-widest">
                 Week {format(currentWeekStart, 'd MMM')}
               </span>
               <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="text-gray-400 hover:text-white h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
               </Button>
            </div>
           )}
           <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setView('list')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'list' ? 'bg-[#f97316] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                 <Grid className="w-3.5 h-3.5" /> List
              </button>
              <button 
                onClick={() => setView('calendar')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-[#f97316] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                 <Layout className="w-3.5 h-3.5" /> Calendar
              </button>
           </div>
        </div>
      </div>

      {view === 'list' ? (
        <div className="space-y-4">
          {loading ? (
               [1,2,3].map(i => <div key={i} className="h-24 rounded-2xl bg-[#1A1D24] animate-pulse border border-border/50" />)
          ) : bookings.length > 0 ? (
            bookings.map((booking) => {
              const dateStr = booking.sessions?.start_time || booking.booking_datetime;
              const d = parseISO(dateStr);
              const dateValid = d && isValid(d);

              return (
                <div key={booking.id} className="bg-[#1A1D24] border border-border/50 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group hover:border-[#f97316]/30 transition-all relative">
                   <div className="w-14 h-14 rounded-2xl bg-black/40 border border-white/5 flex flex-col items-center justify-center text-center shrink-0 self-start sm:self-center">
                      <span className="text-[10px] font-black text-gray-500 uppercase leading-none">{dateValid ? format(d, 'MMM') : '---'}</span>
                      <span className="text-xl font-black text-white leading-none mt-1">{dateValid ? format(d, 'd') : '?'}</span>
                   </div>
                   
                   <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                         <h3 className="font-bold text-white uppercase truncate">{booking.sessions?.title || booking.session_types?.name || 'Class'}</h3>
                         {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold tracking-widest">
                         <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-[#f97316]" /> {dateValid ? format(d, 'HH:mm') : 'Time TBD'}</span>
                         <span className="flex items-center gap-1.5"><CalendarIcon className="w-3.5 h-3.5 text-[#f97316]" /> {dateValid ? format(d, 'EEEE') : 'Date TBD'}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-0 border-white/5 pt-4 sm:pt-0">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => cancelBooking(booking.id)}
                          className="text-gray-600 hover:text-red-500 hover:bg-red-500/10 h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        >
                           <XCircle className="w-4 h-4 mr-2" /> Cancel
                        </Button>
                      )}
                      <div className="p-2 rounded-full bg-white/5 text-gray-600 group-hover:text-[#f97316] group-hover:bg-[#f97316]/10 transition-all">
                         <ChevronRight className="w-5 h-5" />
                      </div>
                   </div>
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center bg-[#1A1D24] border border-dashed border-border/50 rounded-3xl">
               <CalendarIcon className="w-12 h-12 text-gray-700 mx-auto mb-4" />
               <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No bookings found.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#1A1D24] border border-border/50 rounded-3xl p-8 overflow-x-auto">
           <div className="min-w-[800px]">
              <div className="grid grid-cols-7 gap-4 mb-8">
                 {days.map(day => (
                   <div key={day.toString()} className="text-center">
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-2">{format(day, 'EEE')}</p>
                      <div className={`w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-sm font-black transition-all ${isSameDay(day, new Date()) ? 'bg-[#f97316] text-white shadow-lg shadow-[#f97316]/20' : 'text-white bg-black/20'}`}>
                         {format(day, 'd')}
                      </div>
                   </div>
                 ))}
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                 {days.map(day => (
                   <div key={day.toString()} className="space-y-3 min-h-[400px] border-r border-white/5 last:border-0 pr-4">
                      {bookings
                        .filter(b => b.sessions?.start_time && isSameDay(parseISO(b.sessions.start_time), day))
                        .map(booking => (
                          <div 
                            key={booking.id} 
                            className={`p-3 rounded-xl border border-white/5 transition-all group ${booking.status === 'cancelled' ? 'opacity-40 grayscale' : 'bg-black/20 hover:border-[#f97316]/50'}`}
                          >
                             <div className="flex justify-between items-start mb-1">
                                <span className="text-[9px] text-[#f97316] font-black tracking-tighter">{format(parseISO(booking.sessions.start_time), 'HH:mm')}</span>
                                {booking.status === 'confirmed' && <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />}
                             </div>
                             <p className="text-[11px] font-black text-white leading-tight truncate group-hover:text-[#f97316]">{booking.sessions?.title || booking.session_types?.name}</p>
                             <div className="mt-2">
                                {getStatusBadge(booking.status)}
                             </div>
                          </div>
                        ))
                      }
                   </div>
                 ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
