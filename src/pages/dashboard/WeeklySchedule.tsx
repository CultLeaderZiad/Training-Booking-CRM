import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { toast } from 'sonner';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Grid, 
  Layout, 
  Filter,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  CheckCircle2,
  Trash2,
  Zap,
  Info
} from 'lucide-react';
import { format, startOfWeek, addDays, isSameDay, parseISO, isValid } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';

export default function WeeklySchedule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sessionTypes, setSessionTypes] = useState<any[]>([]);
  const [view, setView] = useState<'catalog' | 'grid' | 'calendar'>('catalog');
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedStyleId, setSelectedStyleId] = useState<string | null>(null);

  // Weekly navigation state
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  useEffect(() => {
    fetchSessions();
    fetchSessionTypes();
    if (user) fetchMyBookings();
  }, [currentWeekStart, user]);

  const fetchSessionTypes = async () => {
    const { data } = await supabase.from('session_types').select('*').eq('is_active', true);
    setSessionTypes(data || []);
  };

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const weekStart = new Date(currentWeekStart);
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      weekEnd.setHours(23, 59, 59, 999);

      const weekStartStr = weekStart.toISOString();
      const weekEndStr = weekEnd.toISOString();

      const { data, error } = await supabase
        .from('sessions')
        .select('*, session_types(*), bookings:bookings(count)')
        .gte('start_time', weekStartStr)
        .lte('start_time', weekEndStr)
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast.error('Error fetching sessions: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('scheduled_session_id')
      .eq('user_id', user?.id)
      .filter('status', 'neq', 'cancelled');
    setMyBookings(data?.map(b => b.scheduled_session_id) || []);
  };

  const handleBook = async () => {
    if (!selectedSession || !user) return;
    
    try {
      if (myBookings.includes(selectedSession.id)) {
        toast.error("You've already booked this session!");
        setIsBookingModalOpen(false);
        return;
      }

      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        session_id: selectedSession.session_type_id,
        scheduled_session_id: selectedSession.id,
        status: 'pending',
        booking_datetime: new Date().toISOString()
      });

      if (error) throw error;

      // Create a notification for the user
      await supabase.from('notifications').insert({
        user_id: user.id,
        title: 'Booking Request Sent',
        message: `Your request for "${selectedSession.title}" on ${safeFormat(selectedSession.start_time, 'MMM d')} is pending trainer confirmation.`,
        is_read: false
      });

      toast.success("Booking request sent! Trainer will confirm shortly.");
      setIsBookingModalOpen(false);
      await fetchMyBookings();
      await fetchSessions();
    } catch (error: any) {
      toast.error("Booking failed: " + error.message);
    }
  };

  const handleCancelBooking = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('user_id', user?.id)
        .eq('scheduled_session_id', sessionId);

      if (error) throw error;

      toast.success("Booking cancelled.");
      await fetchMyBookings();
      await fetchSessions();
    } catch (error: any) {
      toast.error("Failed to cancel: " + error.message);
    }
  };

  const safeFormat = (dateStr: string, formatStr: string) => {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, formatStr) : '---';
  };

  const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const filteredSessionTypes = sessionTypes.filter(st => {
    const matchesSearch = st.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || st.category?.toUpperCase() === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', ...new Set(sessionTypes.map(st => st.category?.toUpperCase()).filter(Boolean))];

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-2">
           <h1 className="text-5xl font-black text-white uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Book a Session</h1>
           <p className="text-gray-500 text-sm font-medium">Choose your training style from our premium selection.</p>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
              <button 
                onClick={() => setView('catalog')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'catalog' ? 'bg-[#f97316] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                 <Grid className="w-3.5 h-3.5" /> Catalog
              </button>
              <button 
                onClick={() => setView('grid')}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view !== 'catalog' ? 'bg-[#f97316] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                 <Layout className="w-3.5 h-3.5" /> Full Schedule
              </button>
           </div>
        </div>
      </div>

      {view === 'catalog' ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#1A1D24] p-4 rounded-[32px] border border-border/50">
              <div className="relative w-full lg:w-96">
                 <input 
                   type="text" 
                   placeholder="Search session styles..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="w-full h-12 bg-black/40 border border-white/5 rounded-2xl px-12 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#f97316]/50 transition-all"
                 />
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
              </div>

              <div className="flex flex-wrap gap-2">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setActiveCategory(cat || 'ALL')}
                     className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${activeCategory === cat ? 'bg-[#f97316]/10 border-[#f97316] text-[#f97316]' : 'bg-black/20 border-white/5 text-gray-500 hover:text-white'}`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSessionTypes.map(st => (
                <div key={st.id} className="group bg-[#1A1D24] border border-border/50 rounded-[32px] p-8 flex flex-col hover:border-[#f97316]/30 transition-all duration-300 relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-6 flex flex-col items-end gap-2">
                      <span className="text-2xl font-black text-white">£{st.base_price}</span>
                   </div>
                   
                   <div className="mb-8">
                      <Badge className="bg-[#f97316]/10 text-[#f97316] border-none text-[8px] font-black uppercase px-2 py-0.5 mb-3">{st.category || 'General'}</Badge>
                      <h3 className="text-2xl font-black text-white group-hover:text-[#f97316] transition-colors leading-tight mb-2">{st.name}</h3>
                      <p className="text-gray-500 text-xs line-clamp-2 font-medium">{st.description || 'A premium training session designed to push your limits.'}</p>
                   </div>

                   <div className="flex items-center gap-6 text-[10px] text-gray-500 font-bold tracking-widest mb-10">
                      <span className="flex items-center gap-2"><Users className="w-4 h-4 text-[#f97316]/50" /> {st.default_capacity} Max</span>
                      <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#f97316]/50" /> {st.duration} Mins</span>
                   </div>

                   <Button 
                     onClick={async () => {
                        setSelectedStyleId(st.id);
                        
                        // Check if sessions exist for this style in the current week
                        const styleSessions = sessions.filter(s => s.session_type_id === st.id);
                        
                        if (styleSessions.length === 0) {
                           // Try to find the next available session for this style
                           setLoading(true);
                           const { data: nextSession } = await supabase
                              .from('sessions')
                              .select('start_time')
                              .eq('session_type_id', st.id)
                              .gte('start_time', new Date().toISOString())
                              .order('start_time', { ascending: true })
                              .limit(1)
                              .single();
                           
                           if (nextSession) {
                              const nextDate = parseISO(nextSession.start_time);
                              setCurrentWeekStart(startOfWeek(nextDate, { weekStartsOn: 1 }));
                              toast.info(`Showing sessions for the week of ${format(nextDate, 'MMM d')}`);
                           } else {
                              toast.info("No future sessions found for this style yet.");
                           }
                           setLoading(false);
                        }
                        
                        setView('grid');
                     }}
                     className="mt-auto h-14 bg-[#f97316] hover:bg-[#ea580c] text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-lg shadow-[#f97316]/10"
                   >
                      Select & Choose Time <ChevronRight className="w-4 h-4 ml-2" />
                   </Button>
                </div>
              ))}
           </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-[#1A1D24] p-4 rounded-3xl border border-border/50">
             <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                <button 
                  onClick={() => setView('grid')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'grid' ? 'bg-[#f97316] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                   <Grid className="w-3.5 h-3.5" /> Grid View
                </button>
                <button 
                  onClick={() => setView('calendar')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'calendar' ? 'bg-[#f97316] text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
                >
                   <Layout className="w-3.5 h-3.5" /> Calendar View
                </button>
             </div>

             <div className="flex items-center gap-4">
                <div className="flex items-center bg-black/20 rounded-xl border border-white/5 p-1">
                   <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, -7))} className="text-gray-400 hover:text-white h-8 w-8">
                      <ChevronLeft className="w-4 h-4" />
                   </Button>
                   <span className="text-[10px] font-black text-white px-4 uppercase tracking-widest">
                     {format(currentWeekStart, 'MMM d')} - {format(addDays(currentWeekStart, 6), 'MMM d')}
                   </span>
                   <Button variant="ghost" size="icon" onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))} className="text-gray-400 hover:text-white h-8 w-8">
                      <ChevronRight className="w-4 h-4" />
                   </Button>
                </div>
                
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedStyleId(null);
                    setActiveCategory('ALL');
                    setSearchQuery('');
                  }}
                  className="border-border/50 text-gray-400 text-[10px] uppercase font-black tracking-widest hover:text-white h-10 px-4 rounded-xl"
                >
                   <Filter className="w-3.5 h-3.5 mr-2" /> Clear Filters
                </Button>
             </div>
          </div>

          {view === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {loading ? (
                 [1,2,3,4,5,6].map(i => (
                   <div key={i} className="h-[250px] rounded-3xl bg-[#1A1D24] animate-pulse border border-border/50" />
                 ))
               ) : sessions.filter(s => !selectedStyleId || s.session_type_id === selectedStyleId).length > 0 ? (
                 sessions
                   .filter(s => !selectedStyleId || s.session_type_id === selectedStyleId)
                   .map((session) => {
                     const bookedCount = session.bookings?.[0]?.count || 0;
                     const spotsLeft = Math.max(0, session.capacity - bookedCount);
                     const progress = (bookedCount / session.capacity) * 100;
                     const isAlreadyBooked = myBookings.includes(session.id);

                     return (
                       <div key={session.id} className="group bg-[#1A1D24] border border-border/50 rounded-3xl p-6 relative overflow-hidden flex flex-col hover:border-[#f97316]/30 transition-all duration-300">
                          <div className="absolute top-0 right-0 p-4">
                             <Badge variant="outline" className="bg-black/20 border-white/5 text-gray-400 text-[8px] uppercase font-black flex items-center gap-1.5">
                                <MapPin className="w-2.5 h-2.5" /> Studio
                             </Badge>
                          </div>

                          <div className="mb-4">
                             <h3 className="text-lg font-black text-white group-hover:text-[#f97316] transition-colors leading-tight mb-1">{session.title}</h3>
                             <Badge className="bg-[#f97316]/10 text-[#f97316] border-none text-[8px] font-black uppercase px-2 py-0.5">{session.session_types?.name}</Badge>
                          </div>

                          <div className="space-y-3 mb-6">
                             <div className="flex items-center gap-2 text-gray-400">
                                <span className="text-xs font-bold text-white">{safeFormat(session.start_time, 'EEEE')}</span>
                                <span className="text-xs">{safeFormat(session.start_time, 'HH:mm')}</span>
                             </div>
                             <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-[#f97316]" /> {session.session_types?.duration || 60} Min</span>
                                <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-[#f97316]" /> {spotsLeft} spots left</span>
                             </div>
                          </div>

                          <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
                             <div className="space-y-2">
                                <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                                   <span>Capacity</span>
                                   <span className={spotsLeft <= 2 ? 'text-red-500' : ''}>{bookedCount}/{session.capacity} Booked</span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                   <div 
                                     className={`h-full transition-all duration-500 ${spotsLeft <= 2 ? 'bg-red-500' : 'bg-[#f97316]'}`} 
                                     style={{ width: `${progress}%` }} 
                                   />
                                </div>
                             </div>
                             
                             <div className="flex gap-2">
                                <Button 
                                  disabled={spotsLeft === 0 || isAlreadyBooked}
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setIsBookingModalOpen(true);
                                  }}
                                  className={`flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg transition-all ${isAlreadyBooked ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-[#f97316] hover:bg-[#ea580c] text-white'}`}
                                >
                                   {isAlreadyBooked ? 'BOOKED ✅' : spotsLeft === 0 ? 'FULL' : 'BOOK NOW'}
                                </Button>
                                {isAlreadyBooked && (
                                  <Button 
                                    variant="outline"
                                    onClick={() => handleCancelBooking(session.id)}
                                    className="h-12 w-12 rounded-xl border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                             </div>
                          </div>
                       </div>
                     );
                   })
               ) : (
                 <div className="col-span-full py-20 text-center bg-[#1A1D24] border border-dashed border-border/50 rounded-3xl">
                    <Calendar className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                     <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No matching sessions this week.</p>
                     <div className="flex flex-col items-center gap-3 mt-6">
                        {selectedStyleId && (
                          <Button 
                            variant="link" 
                            onClick={() => setSelectedStyleId(null)}
                            className="text-[#f97316] text-[10px] font-black uppercase"
                          >
                            Show all session styles
                          </Button>
                        )}
                        <Button 
                          variant="outline"
                          onClick={() => setCurrentWeekStart(addDays(currentWeekStart, 7))}
                          className="border-[#f97316]/20 text-[#f97316] text-[10px] font-black uppercase tracking-widest h-10 px-6 rounded-xl hover:bg-[#f97316]/10"
                        >
                           Try Next Week <ChevronRight className="w-3.5 h-3.5 ml-2" />
                        </Button>
                     </div>
                 </div>
               )}
            </div>
          ) : (
            <div className="bg-[#1A1D24] border border-border/50 rounded-3xl p-6 overflow-x-auto">
               <div className="min-w-[800px]">
                  <div className="grid grid-cols-7 gap-4 mb-6">
                     {days.map(day => (
                       <div key={day.toString()} className="text-center">
                          <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">{format(day, 'EEE')}</p>
                          <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-sm font-black ${isSameDay(day, new Date()) ? 'bg-[#f97316] text-white shadow-lg' : 'text-white bg-black/20'}`}>
                             {format(day, 'd')}
                          </div>
                       </div>
                     ))}
                  </div>
                                   <div className="grid grid-cols-7 gap-4">
                     {days.map(day => {
                       const daySessions = sessions
                         .filter(s => isSameDay(parseISO(s.start_time), day))
                         .filter(s => !selectedStyleId || s.session_type_id === selectedStyleId);

                       return (
                         <div key={day.toString()} className="space-y-3 min-h-[400px] border-r border-white/5 last:border-0 pr-4">
                            {daySessions.map(session => {
                              const isAlreadyBooked = myBookings.includes(session.id);
                              return (
                                <div 
                                  key={session.id} 
                                  onClick={() => {
                                    setSelectedSession(session);
                                    setIsBookingModalOpen(true);
                                  }}
                                  className={`p-3 rounded-xl border border-white/5 transition-all cursor-pointer group ${isAlreadyBooked ? 'bg-green-500/5' : 'bg-black/20 hover:border-[#f97316]/50'}`}
                                >
                                   <div className="flex justify-between items-start mb-1">
                                      <p className="text-[10px] text-[#f97316] font-black">{safeFormat(session.start_time, 'HH:mm')}</p>
                                      {isAlreadyBooked && <CheckCircle2 className="w-2.5 h-2.5 text-green-500" />}
                                   </div>
                                   <p className="text-xs font-black text-white leading-tight truncate group-hover:text-[#f97316]">{session.title}</p>
                                   <p className="text-[9px] text-gray-500 mt-1 uppercase font-bold">{Math.max(0, session.capacity - (session.bookings?.[0]?.count || 0))} slots left</p>
                                </div>
                              );
                            })}
                            {daySessions.length === 0 && (
                               <div className="h-full flex items-center justify-center opacity-10">
                                  <div className="w-px h-full bg-white/5" />
                               </div>
                            )}
                         </div>
                       );
                     })}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {/* Booking Side Slider (Sheet) */}
      <Sheet open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <SheetContent className="bg-[#111317] border-l border-white/5 text-white sm:max-w-[450px] p-0 flex flex-col h-full shadow-2xl">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 py-12 md:px-10">
              <SheetHeader className="mb-10 text-left">
              <div className="w-12 h-12 bg-[#f97316]/10 rounded-2xl flex items-center justify-center mb-6 border border-[#f97316]/20">
                 <Zap className="w-6 h-6 text-[#f97316]" />
              </div>
              <SheetTitle className="text-3xl font-black uppercase tracking-tighter leading-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                Confirm Your<br />Session
              </SheetTitle>
              <SheetDescription className="text-gray-500 text-xs font-medium italic mt-2">
                Ready to level up? Review the details below to secure your spot.
              </SheetDescription>
            </SheetHeader>
            
            {selectedSession && (
              <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="p-8 rounded-[32px] bg-[#1A1D24] border border-white/5 space-y-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8">
                       <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-sm font-black text-[#f97316]">
                          {selectedSession.title?.charAt(0)}
                       </div>
                    </div>

                    <div className="space-y-1">
                       <h4 className="text-xl font-black text-white uppercase tracking-tight">{selectedSession.title}</h4>
                       <p className="text-[10px] text-[#f97316] font-black uppercase tracking-widest">{selectedSession.session_types?.name}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8">
                      <div className="space-y-1">
                         <span className="flex items-center gap-2 text-[9px] text-gray-500 uppercase font-black tracking-widest">
                            <Calendar className="w-3 h-3 text-[#f97316]" /> Date
                         </span>
                         <span className="text-sm text-white font-bold">{safeFormat(selectedSession.start_time, 'MMM d, yyyy')}</span>
                      </div>
                      <div className="space-y-1">
                         <span className="flex items-center gap-2 text-[9px] text-gray-500 uppercase font-black tracking-widest">
                            <Clock className="w-3 h-3 text-[#f97316]" /> Time
                         </span>
                         <span className="text-sm text-white font-bold">{safeFormat(selectedSession.start_time, 'HH:mm')}</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-white/5 flex items-center gap-3">
                       <MapPin className="w-4 h-4 text-[#f97316]" />
                       <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">Main Training Ground, Ground Floor</span>
                    </div>
                 </div>

                 <div className="p-8 rounded-[32px] bg-black/20 border border-dashed border-white/5 flex justify-between items-center group hover:border-[#f97316]/30 transition-all">
                    <div className="space-y-1">
                       <span className="text-[9px] text-gray-500 uppercase font-black tracking-[0.2em]">Total Investment</span>
                       <p className="text-xs text-gray-400 font-medium italic">Pay in-person at arrival</p>
                    </div>
                    <span className="text-3xl font-black text-white tracking-tighter">£{selectedSession.price || selectedSession.session_types?.base_price}</span>
                 </div>

                 <div className="bg-[#f97316]/5 border border-[#f97316]/10 p-5 rounded-2xl flex items-start gap-3">
                    <Info className="w-4 h-4 text-[#f97316] mt-0.5" />
                    <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                       By confirming, you agree to our 24-hour cancellation policy. Sessions cancelled within 24 hours may still be charged.
                    </p>
                 </div>
              </div>
            )}

            </div>
            
            <div className="shrink-0 p-6 md:p-10 bg-[#111317]/80 backdrop-blur-md border-t border-white/5 space-y-4">
              <Button 
                onClick={handleBook} 
                className="w-full h-16 bg-[#f97316] hover:bg-[#ea580c] text-white text-[12px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl shadow-[#f97316]/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
              >
                <CheckCircle2 className="w-5 h-5" /> Confirm Booking
              </Button>
              <button 
                onClick={() => setIsBookingModalOpen(false)} 
                className="w-full py-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Back to Schedule
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
