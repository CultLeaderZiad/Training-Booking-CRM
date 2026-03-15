import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, CheckCircle2, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function Notifications() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error: any) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    }
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);
    if (!error) {
      setNotifications(prev => prev.filter(n => n.id !== id));
      toast.success('Notification removed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <div className="flex justify-between items-end">
        <div className="space-y-2">
           <h1 className="text-3xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Notifications</h1>
           <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Stay updated with your booking status and training updates.</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-border/50 text-gray-400 text-[10px] font-black uppercase tracking-widest h-10 px-4 rounded-xl hover:text-white"
          onClick={() => setNotifications(prev => prev.map(n => ({...n, is_read: true})))}
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-20 rounded-2xl bg-[#1A1D24] animate-pulse border border-border/50" />)
        ) : notifications.length > 0 ? (
          notifications.map((notif) => (
            <div 
              key={notif.id} 
              onClick={() => markAsRead(notif.id)}
              className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${notif.is_read ? 'bg-transparent border-border/30 opacity-60' : 'bg-[#1A1D24] border-[#f97316]/30 shadow-[0_0_20px_rgba(249,115,22,0.05)]'}`}
            >
               <div className={`p-2 rounded-xl shrink-0 ${notif.is_read ? 'bg-gray-800 text-gray-500' : 'bg-[#f97316]/10 text-[#f97316]'}`}>
                  <Bell className="w-5 h-5" />
               </div>
               
               <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                     <h3 className={`text-sm font-bold uppercase tracking-tight mb-1 ${notif.is_read ? 'text-gray-400' : 'text-white'}`}>{notif.title}</h3>
                     <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter shrink-0">{format(new Date(notif.created_at), 'MMM d, HH:mm')}</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed pr-8">{notif.message}</p>
               </div>

               <button 
                 onClick={(e) => deleteNotification(notif.id, e)}
                 className="p-2 text-gray-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
               >
                  <Trash2 className="w-4 h-4" />
               </button>
            </div>
          ))
        ) : (
          <div className="py-20 text-center bg-[#1A1D24] border border-dashed border-border/50 rounded-3xl">
             <Bell className="w-12 h-12 text-gray-700 mx-auto mb-4" />
             <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Inbox is clean.</p>
          </div>
        )}
      </div>
    </div>
  );
}
