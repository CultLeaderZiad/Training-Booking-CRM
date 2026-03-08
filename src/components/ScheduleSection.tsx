import { motion } from "framer-motion";
import { useBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  { name: "Barbell Strength", focus: "Strength", location: "Studio", duration: "60 min", day: "Monday", time: "07:00", spots: 3 },
  { name: "Outdoor Conditioning", focus: "Conditioning", location: "Outdoor", duration: "50 min", day: "Monday", time: "18:30", spots: 5 },
  { name: "Upper Body Power", focus: "Strength", location: "Studio", duration: "60 min", day: "Tuesday", time: "07:00", spots: 2 },
  { name: "Beach HIIT", focus: "Conditioning", location: "Outdoor", duration: "45 min", day: "Wednesday", time: "07:30", spots: 6 },
  { name: "Posterior Chain", focus: "Strength", location: "Studio", duration: "60 min", day: "Wednesday", time: "18:30", spots: 1 },
  { name: "Mobility Flow", focus: "Mobility", location: "Studio", duration: "45 min", day: "Thursday", time: "12:00", spots: 4 },
  { name: "Full Body Strength", focus: "Strength", location: "Studio", duration: "60 min", day: "Friday", time: "07:00", spots: 3 },
  { name: "Park Circuit", focus: "Conditioning", location: "Outdoor", duration: "50 min", day: "Saturday", time: "09:00", spots: 8 },
];

const focusColor = (focus: string) => {
  switch (focus) {
    case "Strength": return "bg-primary/20 text-primary border-primary/30";
    case "Conditioning": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "Mobility": return "bg-sky-500/20 text-sky-400 border-sky-500/30";
    default: return "";
  }
};

const ScheduleSection = () => {
  const { handleBook } = useBooking();

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
          <p className="text-muted-foreground text-lg mb-12 max-w-xl">
            Book your spot. Limited places per session.
          </p>
        </motion.div>

        <div className="grid gap-3">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.name + cls.day}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="bg-card border border-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:border-primary/30 transition-colors"
            >
              {/* Day/Time */}
              <div className="sm:w-32 shrink-0">
                <p className="text-sm font-medium text-muted-foreground">{cls.day}</p>
                <p className="text-lg font-semibold">{cls.time}</p>
              </div>

              {/* Class info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold mb-1.5">{cls.name}</h3>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${focusColor(cls.focus)}`}>
                    {cls.focus}
                  </span>
                  <Badge variant="outline" className="text-xs font-normal gap-1">
                    <MapPin className="w-3 h-3" />
                    {cls.location}
                  </Badge>
                  <Badge variant="outline" className="text-xs font-normal gap-1">
                    <Clock className="w-3 h-3" />
                    {cls.duration}
                  </Badge>
                </div>
              </div>

              {/* Availability + Book */}
              <div className="flex items-center gap-4 sm:shrink-0">
                <div className="flex items-center gap-1.5 text-sm">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className={cls.spots <= 2 ? "text-primary font-medium" : "text-muted-foreground"}>
                    {cls.spots} {cls.spots === 1 ? "spot" : "spots"}
                  </span>
                </div>
                <Button
                  size="sm"
                  className="rounded-lg font-medium"
                  onClick={() => handleBook(cls.name)}
                >
                  Book
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
