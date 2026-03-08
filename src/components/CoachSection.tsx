import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import coachPortrait from "@/assets/coach-portrait.png";

const credentials = [
  "10+ years coaching athletes and professionals",
  "Evidence-based programming. No trends, no gimmicks.",
  "Focused on building strength you keep for life",
];

const images = [
  {
    src: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    alt: "Outdoor training in Barcelona",
  },
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80",
    alt: "Clean gym interior",
  },
  {
    src: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&q=80",
    alt: "Beach training session",
  },
];

const CoachSection = () => {
  return (
    <section id="coach" className="py-20 sm:py-28 px-6 bg-secondary/50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-16">
          {/* Portrait */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden">
              <img
                src={coachPortrait}
                alt="Alex Moreno — Strength & Conditioning Coach"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </motion.div>

          {/* Bio */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-primary font-medium text-sm tracking-wider uppercase mb-3">
              Your Coach
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Alex Moreno
            </h2>
            <p className="text-xl text-muted-foreground mb-2 font-light">
              Strength & Conditioning Coach
            </p>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Based in Barcelona. I train busy professionals and expats who want
              structured, efficient sessions — no wasted time. Whether it's in
              the studio or outdoors by the coast, every session has a purpose.
            </p>
            <ul className="space-y-3">
              {credentials.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <span className="text-foreground/90">{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Image strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="aspect-[4/3] rounded-xl overflow-hidden"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoachSection;
