import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#111317] p-8 text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex flex-col md:flex-row gap-4 justify-between items-center bg-[#1A1D24] p-6 rounded-xl border border-border/50">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Admin Control Center</h1>
              <span className="px-2 py-0.5 bg-orange-500/10 text-orange-500 text-[10px] font-bold uppercase rounded tracking-wider">PREMIUM</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Status: Operational | Working as {user?.email}</p>
          </div>
          <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white font-medium shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all" onClick={handleLogout}>
            Sign Out
          </Button>
        </header>

        {/* Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">Total Revenue</h3>
            <p className="text-3xl font-bold text-green-500 mt-2 tracking-tight">£0.00</p>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">New Clients</h3>
            <p className="text-3xl font-bold text-orange-500 mt-2 tracking-tight">0</p>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">Active Sessions</h3>
            <p className="text-3xl font-bold text-white mt-2 tracking-tight">0</p>
          </div>
          <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24]">
            <h3 className="text-xs font-semibold text-gray-400">Pending Requests</h3>
            <p className="text-3xl font-bold text-orange-500 mt-2 tracking-tight">0</p>
          </div>
        </div>

        {/* Panels */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Bookings */}
          <div className="p-6 rounded-xl border border-border/50 bg-[#1A1D24] min-h-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3.5 bg-orange-500 rounded-full"></div>
              <h2 className="text-sm font-bold text-white tracking-wide">Recent Bookings</h2>
            </div>
            <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
              No data available for the selected period.
            </div>
          </div>
          
          {/* System Logs */}
          <div className="p-6 rounded-xl border border-border/50 bg-[#1A1D24] min-h-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-3.5 bg-orange-500 rounded-full"></div>
              <h2 className="text-sm font-bold text-white tracking-wide">System Logs</h2>
            </div>
            <div className="bg-[#111317]/80 rounded-lg p-4 text-xs font-mono text-gray-400 border border-border/30 overflow-auto">
              [SYSTEM] Database initialised successfully<br/>
              [SYSTEM] Authentication provider ready<br/>
              [AUTH] Admin login registered at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
