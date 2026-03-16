import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import AccessDenied from "./pages/auth/AccessDenied";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminLayout from "./components/AdminLayout";
import UserLayout from "./components/UserLayout";
import UserDashboard from "./pages/dashboard/UserDashboard";
import Sessions from "./pages/dashboard/admin/Sessions";
import Clients from "./pages/dashboard/admin/Clients";
import Bookings from "./pages/dashboard/admin/Bookings";
import Profile from "./pages/dashboard/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import WeeklySchedule from "./pages/dashboard/WeeklySchedule";
import MyBookings from "./pages/dashboard/MyBookings";
import Notifications from "./pages/dashboard/Notifications";
import ProfileSettings from "./pages/dashboard/ProfileSettings";
import VoiceflowChat from "./components/VoiceflowChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <VoiceflowChat />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/auth/login" element={<Navigate to="/login" replace />} />
            <Route path="/auth/signup" element={<Navigate to="/signup" replace />} />
            <Route path="/access-denied" element={<AccessDenied />} />
            
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="sessions" element={<Sessions />} />
                <Route path="clients" element={<Clients />} />
                <Route path="bookings" element={<Bookings />} />
              </Route>
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<UserLayout />}>
                <Route index element={<UserDashboard />} />
                <Route path="bookings" element={<WeeklySchedule />} />
                <Route path="my-bookings" element={<MyBookings />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="profile-settings" element={<ProfileSettings />} />
              </Route>
              <Route path="/profile" element={<Profile />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
