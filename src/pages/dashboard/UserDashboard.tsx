import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function UserDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#111317] p-8 text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>User Dashboard</h1>
            <p className="text-sm text-gray-400 mt-2">Welcome back, Member</p>
          </div>
          <Button variant="outline" className="border-red-900/30 bg-transparent text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors" onClick={handleLogout}>
            Sign Out
          </Button>
        </header>

        {/* Metrics Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Active Bookings */}
          <div className="p-6 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">Active Bookings</h3>
            <p className="text-3xl font-bold text-white mt-4 tracking-tight">0</p>
          </div>
          
          {/* Past Sessions */}
          <div className="p-6 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">Past Sessions</h3>
            <p className="text-3xl font-bold text-white mt-4 tracking-tight">0</p>
          </div>
          
          {/* Credits */}
          <div className="p-6 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">Credits</h3>
            <p className="text-3xl font-bold text-white mt-4 tracking-tight">Unlimited</p>
          </div>
        </div>

        {/* Activity Panel */}
        <div className="p-16 rounded-xl border border-border/50 bg-[#1A1D24] flex items-center justify-center min-h-[300px]">
          <p className="text-sm font-medium italic text-gray-500">No recent activity to show.</p>
        </div>

      </div>
    </div>
  );
}
