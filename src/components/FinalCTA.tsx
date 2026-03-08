import { motion } from "framer-motion";
import { useBooking } from "@/hooks/use-booking";
import { Button } from "@/components/ui/button";

const FinalCTA = () => {
  const { handleBook } = useBooking();

  return (
    <section className="py-24 sm:py-32 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Ready to Train?
          </h2>
          <p className="text-muted-foreground text-lg mb-10">
            One session is all it takes to know if this is right for you.
          </p>
          <Button
            size="lg"
            className="text-base px-10 py-6 rounded-lg font-semibold"
            onClick={() => handleBook()}
          >
            Book Your Session
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default FinalCTA;
