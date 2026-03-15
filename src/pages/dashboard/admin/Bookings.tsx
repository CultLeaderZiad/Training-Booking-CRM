import React from 'react';

export default function Bookings() {
  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Bookings</h1>
          <p className="text-sm text-gray-400">View and manage all client bookings across sessions.</p>
        </div>
      </div>
      
      <div className="p-12 text-center rounded-xl border border-dashed border-border/50 bg-[#1A1D24]/50">
         <p className="text-gray-400">Placeholder for Bookings Data Grid</p>
      </div>
    </div>
  );
}
