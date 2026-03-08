import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    quote: "Six months in and I've never been this consistent. The programming just works.",
    name: "Laura",
    age: 31,
    role: "Product Manager",
  },
  {
    quote: "I moved to Barcelona and needed structure. Alex gave me exactly that — no fluff.",
    name: "James",
    age: 37,
    role: "Software Engineer",
  },
  {
    quote: "The outdoor sessions are incredible. Training on the beach at 7am changed my week.",
    name: "Marta",
    age: 29,
    role: "Architect",
  },
  {
    quote: "Straightforward coaching. I show up, I work, I leave stronger. That's it.",
    name: "David",
    age: 42,
    role: "Operations Director",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 sm:py-28 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">
            What Clients Say
          </h2>
          <p className="text-muted-foreground text-lg mb-12 max-w-xl">
            Real feedback from real people.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card border border-border rounded-xl p-6 sm:p-8"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground/90 text-base leading-relaxed mb-5">
                "{t.quote}"
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="text-foreground font-medium">{t.name}</span>, {t.age} · {t.role}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Community photo strip */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { src: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=400&q=80", alt: "Group training session" },
            { src: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80", alt: "Partner workout" },
            { src: "https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=400&q=80", alt: "Outdoor fitness" },
            { src: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=80", alt: "Strength training" },
          ].map((img, i) => (
            <motion.div
              key={img.alt}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="aspect-square rounded-xl overflow-hidden"
            >
              <img src={img.src} alt={img.alt} className="w-full h-full object-cover" loading="lazy" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
