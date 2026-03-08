import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users } from "lucide-react";

interface ClassItem {
  name: string;
  focus: string;
  location: "Studio" | "Outdoor";
  duration: string;
  day: string;
  time: string;
  spots: number;
}

const classes: ClassItem[] = [
  // Strength
  { name: "Strength Foundations", focus: "Strength", location: "Studio", duration: "60 min", day: "Monday", time: "07:00", spots: 3 },
  { name: "Upper Body Focus", focus: "Strength", location: "Studio", duration: "60 min", day: "Wednesday", time: "08:00", spots: 4 },
  { name: "Posterior Chain", focus: "Strength", location: "Studio", duration: "60 min", day: "Friday", time: "07:00", spots: 2 },
  { name: "Full Body Power", focus: "Strength", location: "Studio", duration: "55 min", day: "Saturday", time: "10:00", spots: 3 },
  // Conditioning
  { name: "Beach Conditioning", focus: "Conditioning", location: "Outdoor", duration: "45 min", day: "Tuesday", time: "06:30", spots: 5 },
  { name: "Power Circuit", focus: "Conditioning", location: "Outdoor", duration: "50 min", day: "Thursday", time: "07:00", spots: 2 },
  { name: "Park Training", focus: "Conditioning", location: "Outdoor", duration: "60 min", day: "Saturday", time: "09:00", spots: 6 },
  { name: "HIIT Express", focus: "Conditioning", location: "Studio", duration: "30 min", day: "Monday", time: "18:00", spots: 4 },
  // Mobility
  { name: "Mobility Flow", focus: "Mobility", location: "Studio", duration: "45 min", day: "Wednesday", time: "12:00", spots: 4 },
  { name: "Recovery Session", focus: "Mobility", location: "Studio", duration: "40 min", day: "Friday", time: "18:00", spots: 6 },
  { name: "Morning Stretch", focus: "Mobility", location: "Outdoor", duration: "30 min", day: "Sunday", time: "08:00", spots: 8 },
];

const categories = ["All", "Strength", "Conditioning", "Mobility"] as const;
type Category = (typeof categories)[number];

const focusColor = (focus: string) => {
  switch (focus) {
    case "Strength": return "bg-primary/15 text-primary border-primary/30";
    case "Conditioning": return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
    case "Mobility": return "bg-sky-500/15 text-sky-400 border-sky-500/30";
    default: return "";
  }
};

const locationStyle = (loc: "Studio" | "Outdoor") =>
  loc === "Studio"
    ? "bg-muted text-muted-foreground"
    : "bg-primary/15 text-primary";

const ScheduleSection = () => {
  const { handleBook } = useBooking();
  const [active, setActive] = useState<Category>("All");

  const filtered = active === "All" ? classes : classes.filter((c) => c.focus === active);

  return (
    <section id="schedule" className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Weekly Schedule
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl">
            Book your spot. Limited places per session.
          </p>
        </motion.div>

        {/* Category filter tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                active === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/30"
              }`}
            >
              {cat}
              <span className="ml-1.5 text-xs opacity-70">
                ({cat === "All" ? classes.length : classes.filter((c) => c.focus === cat).length})
              </span>
            </button>
          ))}
        </div>

        {/* Cards grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map((cls, i) => (
              <motion.div
                key={cls.name + cls.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-primary/30 transition-colors group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="text-lg font-semibold leading-snug">{cls.name}</h3>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 flex items-center gap-1.5 ${locationStyle(cls.location)}`}>
                      <MapPin className="w-3 h-3" />
                      {cls.location}
                    </span>
                  </div>

                  <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium mb-4 ${focusColor(cls.focus)}`}>
                    {cls.focus}
                  </span>

                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-sm font-semibold">{cls.day}</span>
                    <span className="text-muted-foreground text-sm">{cls.time}</span>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {cls.duration}
                    </span>
                    <span className={`flex items-center gap-1.5 ${cls.spots <= 2 ? "text-primary font-medium" : ""}`}>
                      <Users className="w-3.5 h-3.5" />
                      {cls.spots} {cls.spots === 1 ? "spot" : "spots"} left
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full rounded-lg font-medium border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  onClick={() => handleBook(cls.name)}
                >
                  Book This Session
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ScheduleSection;
