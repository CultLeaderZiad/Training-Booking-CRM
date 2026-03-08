import { motion } from "framer-motion";
import { MapPin, Clock, Backpack, UserCheck, UserX, Sun } from "lucide-react";

const items = [
  {
    icon: MapPin,
    title: "Base Location",
    text: "Barcelona, Eixample district. Studio sessions at a private training space.",
  },
  {
    icon: Sun,
    title: "Outdoor Locations",
    text: "Parc de la Ciutadella, Barceloneta beach, and Montjuïc hill — depending on the session.",
  },
  {
    icon: Clock,
    title: "Session Length",
    text: "45–60 minutes. Warm-up, work, cool-down. Structured and efficient.",
  },
  {
    icon: Backpack,
    title: "What to Bring",
    text: "Training shoes, water, a towel for outdoor sessions. Everything else is provided.",
  },
  {
    icon: UserCheck,
    title: "Who It's For",
    text: "Busy professionals and expats who want structured, progressive strength training.",
  },
  {
    icon: UserX,
    title: "Not For",
    text: "Anyone looking for a shortcut. This is consistent, honest work — nothing more.",
  },
];

const LogisticsSection = () => {
  return (
    <section id="logistics" className="py-20 sm:py-28 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            Logistics
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl">
            Everything you need to know before your first session.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <item.icon className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogisticsSection;
