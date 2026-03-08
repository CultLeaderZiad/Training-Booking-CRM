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
  { name: "Strength Foundations", focus: "Strength", location: "Studio", duration: "60 min", day: "Monday", time: "07:00", spots: 3 },
  { name: "Beach Conditioning", focus: "Conditioning", location: "Outdoor", duration: "45 min", day: "Tuesday", time: "06:30", spots: 5 },
  { name: "Mobility Flow", focus: "Mobility", location: "Studio", duration: "45 min", day: "Wednesday", time: "12:00", spots: 4 },
  { name: "Power Circuit", focus: "Conditioning", location: "Outdoor", duration: "50 min", day: "Thursday", time: "07:00", spots: 2 },
  { name: "Upper Body Focus", focus: "Strength", location: "Studio", duration: "60 min", day: "Friday", time: "08:00", spots: 4 },
  { name: "Park Training", focus: "Conditioning", location: "Outdoor", duration: "60 min", day: "Saturday", time: "09:00", spots: 6 },
];

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

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls, i) => (
            <motion.div
              key={cls.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col justify-between hover:border-primary/30 transition-colors group"
            >
              {/* Header: name + location badge */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold leading-snug">{cls.name}</h3>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0 flex items-center gap-1.5 ${locationStyle(cls.location)}`}>
                    <MapPin className="w-3 h-3" />
                    {cls.location}
                  </span>
                </div>

                {/* Focus tag */}
                <span className={`inline-block text-xs px-2.5 py-0.5 rounded-full border font-medium mb-4 ${focusColor(cls.focus)}`}>
                  {cls.focus}
                </span>

                {/* Day + Time */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-sm font-semibold">{cls.day}</span>
                  <span className="text-muted-foreground text-sm">{cls.time}</span>
                </div>

                {/* Duration + Spots */}
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

              {/* Book button */}
              <Button
                variant="outline"
                className="w-full rounded-lg font-medium border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                onClick={() => handleBook(cls.name)}
              >
                Book This Session
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ScheduleSection;
