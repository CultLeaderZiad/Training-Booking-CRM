import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { ShieldAlert } from 'lucide-react';

export default function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0E1113] flex items-center justify-center p-4">
      <div className="max-w-md w-full flex flex-col items-center text-center space-y-8">
        
        {/* Glowing Shield Icon */}
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full scale-150"></div>
          <div className="bg-[#1a1112] p-4 rounded-full border border-red-500/20 relative z-10 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-4">
          <h1 className="text-[32px] font-bold tracking-normal text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Access Denied
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed px-2 font-medium">
            You don't have the necessary permissions to view this page. If you believe this is an error, please contact support.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 pt-2">
          <Button 
            variant="outline" 
            className="border-gray-700 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white transition-colors h-10 px-6 rounded-lg text-sm font-medium"
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
          <Button 
            className="bg-[#f97316] hover:bg-[#ea580c] text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] border-none transition-all h-10 px-6 rounded-lg text-sm font-medium"
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
