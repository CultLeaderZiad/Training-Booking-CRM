import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { 
  Plus, 
  Calendar, 
  Users, 
  Settings, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Bell
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState('Last 30 Days');

  return (
    <div className="p-6 md:p-8 space-y-8">
      
      {/* Page Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Overview</h1>
          <p className="text-sm text-gray-400">Welcome to your admin control center. Here is what is happening today.</p>
        </div>
        
        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild size="sm" className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 border border-[#f97316]/20 shadow-none font-medium h-9">
            <Link to="/admin/sessions">
              <Plus className="w-4 h-4 mr-2" />
              New Session
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-none font-medium h-9">
            <Link to="/admin/bookings">
              <Calendar className="w-4 h-4 mr-2" />
              Bookings
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-white/5 text-white hover:bg-white/10 border border-white/10 shadow-none font-medium h-9">
            <Link to="/admin/clients">
              <Users className="w-4 h-4 mr-2" />
              Clients
            </Link>
          </Button>
          <Button size="icon" variant="outline" className="h-9 w-9 bg-[#1A1D24] border-border/50 text-gray-400 hover:text-white shrink-0">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Filters (Date Range) */}
      <div className="flex items-center justify-between border-b border-border/50 pb-4">
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase">Core Metrics</h2>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="bg-[#1A1D24] border border-border/50 text-white text-xs rounded-md px-3 py-1.5 outline-none focus:border-[#f97316]/50 transition-colors cursor-pointer"
        >
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Revenue</h3>
            <span className="p-2 bg-green-500/10 rounded-lg text-green-500">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">£12,450</p>
            <span className="flex items-center text-xs font-medium text-green-500 mb-1.5 bg-green-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +14.5%
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-green-500/5 rounded-full blur-2xl group-hover:bg-green-500/10 transition-colors"></div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">New Clients</h3>
            <span className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">124</p>
            <span className="flex items-center text-xs font-medium text-green-500 mb-1.5 bg-green-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +5.2%
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors"></div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Sessions</h3>
            <span className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">32</p>
            <span className="flex items-center text-xs font-medium text-red-500 mb-1.5 bg-red-500/10 px-1.5 py-0.5 rounded">
              <ArrowDownRight className="w-3 h-3 mr-0.5" /> -2.1%
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-colors"></div>
        </div>

        <div className="p-5 rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending Requests</h3>
            <span className="p-2 bg-[#f97316]/10 rounded-lg text-[#f97316]">
              <Bell className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end gap-3">
            <p className="text-3xl font-bold text-white tracking-tight">18</p>
            <span className="flex items-center text-xs font-medium text-green-500 mb-1.5 bg-green-500/10 px-1.5 py-0.5 rounded">
              <ArrowUpRight className="w-3 h-3 mr-0.5" /> +12%
            </span>
          </div>
          <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-[#f97316]/5 rounded-full blur-2xl group-hover:bg-[#f97316]/10 transition-colors"></div>
        </div>

      </div>

      {/* Quick Panels */}
      <div className="grid gap-6 lg:grid-cols-2 pt-4">
        
        {/* Recent Bookings List */}
        <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-border/50 flex items-center justify-between bg-black/10">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-4 bg-[#f97316] rounded-full"></div>
              <h2 className="text-base font-bold text-white tracking-wide">Recent Bookings</h2>
            </div>
            <Link to="/admin/bookings" className="text-xs text-[#f97316] hover:text-[#ea580c] font-medium transition-colors">View All</Link>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
             {/* Mock List Items */}
             {[1,2,3,4,5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/30 bg-white/5 hover:bg-white/10 transition-colors">
                   <div>
                     <p className="text-sm font-medium text-white mb-0.5">Jane Doe</p>
                     <p className="text-xs text-gray-400">HIIT Intensive • Tomorrow, 10:00 AM</p>
                   </div>
                   <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-[#f97316]/10 text-[#f97316] border border-[#f97316]/20">
                     Pending
                   </span>
                </div>
             ))}
          </div>
        </div>
        
        {/* Quick System Logs */}
        <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden flex flex-col h-[400px]">
          <div className="p-6 border-b border-border/50 flex items-center gap-3 bg-black/10">
            <div className="w-1.5 h-4 bg-gray-600 rounded-full"></div>
            <h2 className="text-base font-bold text-white tracking-wide">System Logs</h2>
          </div>
          <div className="flex-1 bg-[#111317]/80 p-5 text-xs font-mono text-gray-400 overflow-y-auto">
            <div className="space-y-3">
              <p><span className="text-green-500 mr-2">[SYSTEM]</span> Database initialised successfully</p>
              <p><span className="text-blue-500 mr-2">[AUTH]</span> Admin login registered at {new Date().toLocaleTimeString()}</p>
              <p><span className="text-purple-500 mr-2">[API]</span> Fetched 18 pending bookings</p>
              <p><span className="text-yellow-500 mr-2">[WARN]</span> High CPU usage detected on edge function</p>
              <p><span className="text-green-500 mr-2">[SYSTEM]</span> Backup created successfully</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
