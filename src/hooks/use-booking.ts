import { useNavigate } from "react-router-dom";

export const useBooking = () => {
  const navigate = useNavigate();

  const handleBook = (className?: string, sessionId?: string) => {
    // Navigate to the login/signup page where they can access their dashboard
    // We can pass the className and sessionId as state if we want to pre-select it after login later
    navigate("/login", { 
      state: { 
        intentClass: className,
        intentSessionId: sessionId
      } 
    });
  };

  return { handleBook };
};
