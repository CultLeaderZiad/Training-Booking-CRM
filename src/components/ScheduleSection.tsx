import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, ArrowRight, Calendar as CalendarIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, startOfWeek, addDays, parseISO, isValid } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Session {
  id: string;
  title: string;
  start_time: string;
  capacity: number;
  session_types: {
    name: string;
    duration: number;
    location: string;
    category: string;
  };
  bookings: { count: number }[];
}

const focusColor = (category: string) => {
  const cat = category?.toLowerCase() || "";
  if (cat.includes("strength")) return "bg-primary/15 text-primary border-primary/30";
  if (cat.includes("hiit") || cat.includes("conditioning")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  if (cat.includes("mobility") || cat.includes("stretch")) return "bg-sky-500/15 text-sky-400 border-sky-500/30";
  return "bg-muted text-muted-foreground border-border";
};

const ScheduleSection = () => {
  const { handleBook } = useBooking();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = addDays(weekStart, 7);

      const { data, error } = await supabase
        .from('sessions')
        .select(`
          id, 
          title, 
          start_time, 
          capacity,
          session_types (
            name,
            duration,
            location,
            category
          ),
          bookings:bookings(count)
        `)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      setSessions(data as any || []);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast.error("Could not load schedule");
    } finally {
      setLoading(false);
    }
  };

  const safeFormat = (dateStr: string, formatStr: string) => {
    const d = parseISO(dateStr);
    return isValid(d) ? format(d, formatStr) : '---';
  };

  return (
    <section id="schedule" className="py-24 sm:py-32 px-6 bg-gradient-to-b from-background to-background/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Weekly <span className="text-primary">Schedule</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl font-medium">
              Transform your goals into reality. Book your spot in our premium studio or outdoor sessions.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary bg-primary/10 px-4 py-2 rounded-full border border-primary/20"
          >
            <CalendarIcon className="w-4 h-4" />
            {format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'MMM d')} - {format(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), 6), 'MMM d')}
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-[280px] rounded-2xl bg-muted/30 animate-pulse border border-border/50" />
            ))}
          </div>
        ) : sessions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sessions.map((session, i) => {
              const bookedCount = session.bookings?.[0]?.count || 0;
              const spotsLeft = Math.max(0, session.capacity - bookedCount);
              const isLowAvailability = spotsLeft > 0 && spotsLeft <= 2;

              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group bg-card/40 backdrop-blur-sm border border-border/50 rounded-[24px] p-6 flex flex-col justify-between hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300 relative overflow-hidden"
                >
                  {isLowAvailability && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-primary text-primary-foreground text-[9px] font-black uppercase py-1 px-3 rounded-bl-xl tracking-tighter shadow-lg">
                        Final Call
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="mb-4">
                      <Badge variant="outline" className="bg-background/50 border-border/50 text-muted-foreground text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-2">
                        {session.session_types?.category || 'Training'}
                      </Badge>
                      <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                        {session.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase opacity-70">
                        <MapPin className="w-3 h-3 text-primary" />
                        {session.session_types?.location || 'Barcelona'}
                      </div>
                    </div>

                    <div className="space-y-3 mb-8">
                      <div className="flex items-center justify-between">
                        <div className="bg-muted/50 rounded-xl px-3 py-2 border border-border/50">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Day</p>
                          <p className="text-sm font-bold">{safeFormat(session.start_time, 'EEEE')}</p>
                        </div>
                        <div className="bg-muted/50 rounded-xl px-3 py-2 border border-border/50 text-right">
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Time</p>
                          <p className="text-sm font-bold">{safeFormat(session.start_time, 'HH:mm')}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-primary" />
                          {session.session_types?.duration} min
                        </span>
                        <span className={`flex items-center gap-1.5 ${isLowAvailability ? "text-primary font-black" : ""}`}>
                          <Users className="w-3.5 h-3.5 text-primary" />
                          {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleBook(session.title, session.id)}
                    disabled={spotsLeft === 0}
                    className={`w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] group ${
                      spotsLeft === 0 
                        ? "bg-muted text-muted-foreground border-border" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                    }`}
                  >
                    {spotsLeft === 0 ? "Fully Booked" : (
                      <>
                        Book This Session <ArrowRight className="w-3.5 h-3.5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-muted/20 rounded-[32px] border border-dashed border-border/50"
          >
            <CalendarIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-muted-foreground mb-2">No Sessions Scheduled This Week</h3>
            <p className="text-sm text-muted-foreground/60 max-w-md mx-auto">
              Our coach is working on the new schedule. Check back shortly or contact us to arrange a private session.
            </p>
            <Button variant="outline" className="mt-6 rounded-full border-primary/20 hover:bg-primary/5 text-primary">
              Contact Alex Moreno
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default ScheduleSection;
