import { toast } from "sonner";

export const useBooking = () => {
  const handleBook = (className?: string) => {
    toast("Booking coming soon", {
      description: className
        ? `${className} — we'll have online booking ready shortly.`
        : "Online booking is launching soon. Stay tuned.",
      duration: 3000,
    });
  };

  return { handleBook };
};
