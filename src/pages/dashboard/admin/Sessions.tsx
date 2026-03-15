import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addWeeks, addDays, format, isAfter, parseISO, startOfWeek, subWeeks } from 'date-fns';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2,
  FolderOpen,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Dumbbell,
  MoreHorizontal,
  RefreshCw,
  LayoutList,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Switch } from '../../../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { supabase } from '@/lib/supabase';

export default function Sessions() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('types');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [searchQuery, setSearchQuery] = useState('');

  // DB State
  const [categories, setCategories] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewCategoryModalOpen, setIsViewCategoryModalOpen] = useState(false);
  const [isViewScheduleModalOpen, setIsViewScheduleModalOpen] = useState(false);
  
  // Holds data for the Currently Editing entities
  const [viewingSession, setViewingSession] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [viewingSchedule, setViewingSchedule] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingEntity, setDeletingEntity] = useState<{type: 'session' | 'category' | 'session_instance', data: any} | null>(null);

  const [sessionFormData, setSessionFormData] = useState({ name: '', category_id: '', price: '', duration: '', slots: '', capacity: '', description: '' });
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });
  const [scheduledSessions, setScheduledSessions] = useState<any[]>([]);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [scheduleFormData, setScheduleFormData] = useState({ 
    session_type_id: '', 
    title: '', 
    description: '', 
    capacity: '', 
    date: '', 
    time: '',
    is_recurring: false,
    repeat_every: '1',
    ends_by: 'date',
    end_date: '',
    total_sessions: '12',
    price_override: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, sesRes, schedRes] = await Promise.all([
        supabase.from('session_categories').select('*').order('created_at', { ascending: false }),
        supabase.from('session_types').select('*, session_categories(name)').order('created_at', { ascending: false }),
        supabase.from('sessions').select('*, session_types(name, base_price), bookings:bookings(count)').order('start_time', { ascending: true })
      ]);
      
      if (catRes.error) throw catRes.error;
      if (sesRes.error) throw sesRes.error;

      // Calculate session counts per category
      const categoriesWithCounts = catRes.data.map(cat => ({
        ...cat,
        sessionCount: sesRes.data.filter(s => s.category_id === cat.id).length
      }));

      setCategories(categoriesWithCounts);
      
      // format sessions for UI
      const formattedSessions = sesRes.data.map(s => ({
        ...s,
        categoryName: s.session_categories?.name || 'Unknown'
      }));
      setSessions(formattedSessions);

      if (!schedRes.error) {
        // Format scheduled sessions to include booking counts
        const formattedScheduled = schedRes.data.map((s: any) => ({
          ...s,
          bookingCount: s.bookings?.[0]?.count || 0
        }));
        setScheduledSessions(formattedScheduled);
      }
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- Session Modal Logic ---
  const openViewModal = (session: any) => {
    setViewingSession(session);
    setIsViewModalOpen(true);
  };

  const openSessionModal = (session: any = null) => {
    setIsViewModalOpen(false); // Close view modal if open
    if (session) {
      setEditingSession(session);
      setSessionFormData({
        name: session.name,
        category_id: session.category_id,
        price: session.base_price.toString(),
        duration: session.duration?.toString() || '60',
        slots: session.max_slots.toString(),
        capacity: session.capacity?.toString() || '',
        description: session.description || '',
      });
    } else {
      setEditingSession(null);
      setSessionFormData({ 
        name: '', 
        category_id: categories[0]?.id || '', 
        price: '', 
        duration: '', 
        slots: '',
        capacity: '',
        description: ''
      });
    }
    setIsSessionModalOpen(true);
  };

  const handleToggleActive = async () => {
    if (!viewingSession) return;
    const newStatus = !viewingSession.is_active;

    try {
      const { error } = await supabase.from('session_types').update({ is_active: newStatus }).eq('id', viewingSession.id);
      if (error) throw error;
      
      toast.success(`Session ${newStatus ? 'activated' : 'deactivated'} successfully`);
      
      // update local
      setViewingSession({ ...viewingSession, is_active: newStatus });
      setSessions(prev => prev.map(s => s.id === viewingSession.id ? { ...s, is_active: newStatus } : s));
    } catch (e: any) {
      toast.error('Failed to change status: ' + e.message);
    }
  };

  const handleSaveSession = async () => {
    if (!sessionFormData.name || !sessionFormData.category_id || !sessionFormData.price) {
      toast.error('Please fill in Name, Category, and Price');
      return;
    }
    
    const payload = {
      name: sessionFormData.name,
      category_id: sessionFormData.category_id,
      base_price: Number(sessionFormData.price),
      duration: Number(sessionFormData.duration) || 60,
      max_slots: Number(sessionFormData.slots) || 10,
      capacity: sessionFormData.capacity ? Number(sessionFormData.capacity) : null,
      description: sessionFormData.description,
      is_active: true
    };

    try {
      if (editingSession) {
        const { error } = await supabase.from('session_types').update(payload).eq('id', editingSession.id);
        if (error) throw error;
        toast.success('Session updated successfully!');
      } else {
        const { error } = await supabase.from('session_types').insert([payload]);
        if (error) throw error;
        toast.success('New session created!');
      }
      setIsSessionModalOpen(false);
      fetchData(); // refresh
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // --- Category Modal Logic ---
  const openViewCategoryModal = (category: any) => {
    setViewingCategory(category);
    setIsViewCategoryModalOpen(true);
  };

  const openCategoryModal = (category: any = null) => {
    setIsViewCategoryModalOpen(false);
    if (category) {
      setEditingCategory(category);
      setCategoryFormData({ name: category.name, description: category.description || '' });
    } else {
      setEditingCategory(null);
      setCategoryFormData({ name: '', description: '' });
    }
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryFormData.name) {
      toast.error('Category Name is required');
      return;
    }
    const payload = { name: categoryFormData.name, description: categoryFormData.description };
    try {
      if (editingCategory) {
        const { error } = await supabase.from('session_categories').update(payload).eq('id', editingCategory.id);
        if (error) throw error;
        toast.success('Category updated!');
      } else {
        const { error } = await supabase.from('session_categories').insert([payload]);
        if (error) throw error;
        toast.success('Category created!');
      }
      setIsCategoryModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };
  const openViewScheduleModal = (session: any) => {
    setViewingSchedule(session);
    setIsViewScheduleModalOpen(true);
  };

  const handleScheduleChange = (field: string, value: string) => {
    if (field === 'session_type_id') {
      const type = sessions.find(s => s.id === value);
      if (type) {
        setScheduleFormData({
          ...scheduleFormData,
          session_type_id: value,
          capacity: (type.capacity || type.max_slots || '').toString(),
          description: type.description || '',
          title: type.name || ''
        });
      } else {
        setScheduleFormData({ ...scheduleFormData, session_type_id: value });
      }
    } else if (field === 'is_recurring') {
       setScheduleFormData({ ...scheduleFormData, is_recurring: !scheduleFormData.is_recurring });
    } else {
      setScheduleFormData({ ...scheduleFormData, [field]: value });
    }
  };

  const handleSaveSchedule = async () => {
    const start_base = new Date(`${date}T${time}`);
    const duration = sessions.find(s => s.id === session_type_id)?.duration || 60;
    
    let payloads = [];
    const groupId = crypto.randomUUID();

    if (!scheduleFormData.is_recurring) {
      payloads.push({
        session_type_id,
        title,
        description,
        capacity: Number(capacity) || 1,
        price: scheduleFormData.price_override ? Number(scheduleFormData.price_override) : null,
        start_time: start_base.toISOString(),
        end_time: new Date(start_base.getTime() + duration * 60000).toISOString(),
        is_recurring: false
      });
    } else {
      // Recurrence Logic
      let currentStart = new Date(start_base);
      const repeatEvery = Number(scheduleFormData.repeat_every) || 1;
      
      if (scheduleFormData.ends_by === 'date') {
        const endDate = new Date(scheduleFormData.end_date);
        endDate.setHours(23, 59, 59, 999);
        
        while (!isAfter(currentStart, endDate)) {
          payloads.push({
            session_type_id,
            title,
            description,
            capacity: Number(capacity) || 1,
            price: scheduleFormData.price_override ? Number(scheduleFormData.price_override) : null,
            start_time: currentStart.toISOString(),
            end_time: new Date(currentStart.getTime() + duration * 60000).toISOString(),
            is_recurring: true,
            group_id: groupId
          });
          currentStart = addWeeks(currentStart, repeatEvery);
        }
      } else {
        const total = Number(scheduleFormData.total_sessions) || 1;
        for (let i = 0; i < total; i++) {
          payloads.push({
            session_type_id,
            title,
            description,
            capacity: Number(capacity) || 1,
            price: scheduleFormData.price_override ? Number(scheduleFormData.price_override) : null,
            start_time: currentStart.toISOString(),
            end_time: new Date(currentStart.getTime() + duration * 60000).toISOString(),
            is_recurring: true,
            group_id: groupId
          });
          currentStart = addWeeks(currentStart, repeatEvery);
        }
      }
    }

    try {
      const { error } = await supabase.from('sessions').insert(payloads);
      if (error) throw error;
      toast.success(payloads.length > 1 ? `Scheduled ${payloads.length} sessions successfully!` : 'Session scheduled successfully!');
      setIsScheduleModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // --- Delete Logic ---
  const openDeleteModal = (type: 'session' | 'category' | 'session_instance', data: any) => {
    setIsViewModalOpen(false);
    setIsViewCategoryModalOpen(false);
    setIsViewScheduleModalOpen(false);
    setDeletingEntity({ type, data });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEntity) return;
    try {
      if (deletingEntity.type === 'session') {
        const { error } = await supabase.from('session_types').delete().eq('id', deletingEntity.data.id);
        if (error) throw error;
        toast.success('Session template deleted.');
      } else if (deletingEntity.type === 'category') {
        const { error } = await supabase.from('session_categories').delete().eq('id', deletingEntity.data.id);
        if (error) throw error;
        toast.success('Category deleted.');
      } else {
        const { error } = await supabase.from('sessions').delete().eq('id', deletingEntity.data.id);
        if (error) throw error;
        toast.success('Scheduled session removed.');
      }
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error: any) {
      if(error.message.includes('violates foreign key constraint')) {
          toast.error(`Cannot delete this entity because it is in use.`);
      } else {
          toast.error(error.message);
      }
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Sessions Management</h1>
          <p className="text-sm text-gray-400">Create and manage your session offerings, prices, and categories.</p>
        </div>
        
        {/* Primary Actions based on tab */}
        <div className="flex items-center gap-3">
           {activeTab === 'active' && (
             <div className="flex bg-[#1A1D24] p-1 rounded-lg border border-border/50 mr-2">
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setViewMode('list')}
                 className={`h-7 px-3 rounded-md transition-all ${viewMode === 'list' ? 'bg-[#f97316] text-white' : 'text-gray-400 hover:text-white'}`}
               >
                 <LayoutList className="w-3.5 h-3.5 mr-1.5" />
                 List
               </Button>
               <Button 
                 variant="ghost" 
                 size="sm" 
                 onClick={() => setViewMode('calendar')}
                 className={`h-7 px-3 rounded-md transition-all ${viewMode === 'calendar' ? 'bg-[#f97316] text-white' : 'text-gray-400 hover:text-white'}`}
               >
                 <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                 Calendar
               </Button>
             </div>
           )}
           <Button 
             className="bg-[#f97316] hover:bg-[#ea580c] text-white"
             onClick={() => {
               if(activeTab === 'types') {
                 openSessionModal();
               } else if(activeTab === 'categories') {
                 openCategoryModal();
               } else {
                 setScheduleFormData({
                   session_type_id: '',
                   title: '',
                   description: '',
                   capacity: '',
                   date: '',
                   time: ''
                 });
                 setIsScheduleModalOpen(true);
               }
             }}
           >
             <Plus className="w-4 h-4 mr-2" />
             {activeTab === 'types' ? 'New Session Type' : activeTab === 'categories' ? 'New Category' : 'Schedule Session'}
           </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="types" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-[#1A1D24] border border-border/50">
             <TabsTrigger value="types" className="data-[state=active]:bg-[#f97316] data-[state=active]:text-white">Session Types</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-[#f97316] data-[state=active]:text-white">Active Sessions</TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-[#f97316] data-[state=active]:text-white">Categories</TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input 
              placeholder={`Search ${activeTab === 'types' ? 'sessions' : 'categories'}...`}
              className="pl-9 bg-[#1A1D24] border-border/50 focus-visible:ring-[#f97316]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- SESSION TYPES TAB --- */}
        <TabsContent value="types" className="mt-0 outline-none">
          <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-border/50 hover:bg-transparent">
                   <TableHead className="text-gray-400 font-semibold tracking-wide">Name</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Description</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Category</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Price</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Duration</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Capacity</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Status</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Status</TableHead>
                  <TableHead className="text-right text-gray-400 font-semibold tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase())).map((type) => (
                  <TableRow 
                    key={type.id} 
                    className="border-border/50 hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => openViewModal(type)}
                  >
                     <TableCell className="font-medium text-white">{type.name}</TableCell>
                    <TableCell className="text-gray-400 text-sm max-w-[200px] truncate">{type.description || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-white/5 text-gray-300 border-border/50">
                        {type.categoryName}
                      </Badge>
                    </TableCell>
                     <TableCell className="text-gray-300">£{type.base_price}</TableCell>
                    <TableCell className="text-gray-300">{type.duration} mins</TableCell>
                    <TableCell className="text-gray-300">{type.capacity || type.max_slots} slots</TableCell>
                    <TableCell>
                      {type.is_active ? (
                        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border border-green-500/20">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-500/10 text-gray-400 hover:bg-gray-500/20 shadow-none border border-gray-500/20">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="w-8 h-8 rounded-full text-gray-500 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-all"
                         onClick={(e) => { e.stopPropagation(); openViewModal(type); }}
                       >
                          <Eye className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!loading && sessions.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <FolderOpen className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No Session Types Found</h3>
                <p className="text-sm text-gray-400">Get started by creating your first session template.</p>
              </div>
            )}
          </div>
        </TabsContent>
        {/* --- ACTIVE SESSIONS TAB --- */}
        <TabsContent value="active" className="mt-0 outline-none">
          {viewMode === 'list' ? (
            <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-black/20">
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-gray-400 font-semibold tracking-wide">Title</TableHead>
                    <TableHead className="text-gray-400 font-semibold tracking-wide">Description</TableHead>
                    <TableHead className="text-gray-400 font-semibold tracking-wide">Date</TableHead>
                    <TableHead className="text-gray-400 font-semibold tracking-wide">Time</TableHead>
                    <TableHead className="text-gray-400 font-semibold tracking-wide">Capacity</TableHead>
                    <TableHead className="text-right text-gray-400 font-semibold tracking-wide">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {scheduledSessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map((session) => (
                    <TableRow 
                      key={session.id} 
                      className="border-border/50 hover:bg-white/5 transition-colors cursor-pointer group"
                      onClick={() => openViewScheduleModal(session)}
                    >
                      <TableCell className="font-medium text-white flex items-center gap-2">
                        {session.title}
                        {session.is_recurring && (
                          <RefreshCw className="w-3 h-3 text-[#f97316] animate-pulse-slow" />
                        )}
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm max-w-[200px] truncate">{session.description || '-'}</TableCell>
                      <TableCell className="text-gray-300">
                         {new Date(session.start_time).toLocaleDateString('en-GB')}
                      </TableCell>
                      <TableCell className="text-gray-300">
                         {new Date(session.start_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="text-gray-300">
                         <button 
                           onClick={(e) => {
                             e.stopPropagation();
                             navigate(`/admin/bookings?session=${session.id}`);
                           }}
                           className="hover:scale-105 transition-transform"
                         >
                           <Badge variant="outline" className={`bg-white/5 border-white/10 ${session.bookingCount >= session.capacity ? 'text-red-500 border-red-500/50' : 'text-[#f97316]'}`}>
                              {session.bookingCount} / {session.capacity} Booked
                           </Badge>
                         </button>
                      </TableCell>
                      <TableCell className="text-right">
                         <Button 
                           variant="ghost" 
                           size="icon" 
                           className="w-8 h-8 rounded-full text-gray-500 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-all"
                           onClick={(e) => { e.stopPropagation(); openViewScheduleModal(session); }}
                         >
                            <Eye className="w-4 h-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {!loading && scheduledSessions.length === 0 && (
                <div className="p-12 text-center flex flex-col items-center justify-center">
                  <CalendarIcon className="h-12 w-12 text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-1">No Active Sessions Scheduled</h3>
                  <p className="text-sm text-gray-400">Schedule your first session by clicking 'Schedule Session'.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {/* Calendar Controls */}
              <div className="flex items-center justify-between bg-[#1A1D24] border border-border/50 p-4 rounded-xl">
                 <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 border border-border/50 rounded-lg p-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
                      >
                         <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 px-3 text-xs font-bold uppercase text-[#f97316] hover:bg-[#f97316]/10"
                        onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
                      >
                        Today
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                         {format(currentWeekStart, 'MMMM yyyy')}
                      </h2>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Week {format(currentWeekStart, 'w')}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent border-border/50 text-gray-400 hover:text-white hover:bg-white/5">
                       Jump to Date
                    </Button>
                 </div>
              </div>

              {/* Weekly Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                 {[0,1,2,3,4,5,6].map((dayOffset) => {
                    const day = addDays(currentWeekStart, dayOffset);
                    const daySessions = scheduledSessions.filter(s => 
                      format(new Date(s.start_time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
                    );

                    return (
                      <div key={dayOffset} className="flex flex-col gap-3 min-h-[300px]">
                         <div className="text-center p-2 rounded-lg bg-black/20 border border-border/10">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{format(day, 'EEEE')}</p>
                            <p className="text-xl font-black text-white">{format(day, 'dd')}</p>
                         </div>
                         
                         <div className="flex-1 space-y-3">
                            {daySessions.map(s => (
                              <div 
                                key={s.id} 
                                onClick={() => openViewScheduleModal(s)}
                                className="p-3 rounded-xl bg-[#1A1D24] border border-border/50 border-l-4 border-l-[#f97316] hover:bg-white/5 cursor-pointer transition-all group relative overflow-hidden"
                              >
                                 <p className="text-[11px] font-bold text-white mb-1 line-clamp-1 group-hover:text-[#f97316] transition-colors">{s.title}</p>
                                 <div className="flex items-center gap-2 text-[9px] text-gray-400 mb-2">
                                    <Clock className="w-2.5 h-2.5" />
                                    {format(new Date(s.start_time), 'HH:mm')} - {format(new Date(s.end_time), 'HH:mm')}
                                 </div>
                                 <div className="space-y-1.5">
                                    <div className="flex justify-between text-[8px] font-bold">
                                       <span className="text-gray-500 uppercase">Booked</span>
                                       <span className={s.bookingCount >= s.capacity ? 'text-red-500' : 'text-[#f97316]'}>{s.bookingCount}/{s.capacity}</span>
                                    </div>
                                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                       <div 
                                         className={`h-full transition-all duration-500 ${s.bookingCount >= s.capacity ? 'bg-red-500' : 'bg-[#f97316]'}`}
                                         style={{ width: `${Math.min((s.bookingCount / s.capacity) * 100, 100)}%` }}
                                       />
                                    </div>
                                 </div>
                              </div>
                            ))}

                            <button 
                              onClick={() => {
                                setScheduleFormData({
                                  ...scheduleFormData,
                                  date: format(day, 'yyyy-MM-dd')
                                });
                                setIsScheduleModalOpen(true);
                              }}
                              className="w-full py-4 rounded-xl border-2 border-dashed border-border/20 flex flex-col items-center justify-center text-gray-600 hover:border-[#f97316]/40 hover:text-[#f97316] transition-all group"
                            >
                               <Plus className="w-5 h-5 mb-1 opacity-20 group-hover:opacity-100" />
                               <span className="text-[9px] font-bold uppercase tracking-wider opacity-40 group-hover:opacity-100">Empty Slot</span>
                            </button>
                         </div>
                      </div>
                    );
                 })}
              </div>
            </div>
          )}
        </TabsContent>


        {/* --- CATEGORIES TAB --- */}
        <TabsContent value="categories" className="mt-0 outline-none">
          <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-lg overflow-hidden">
            <Table>
              <TableHeader className="bg-black/20">
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-gray-400 font-semibold tracking-wide w-1/4">Name</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide w-1/2">Description</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Sessions</TableHead>
                  <TableHead className="text-right text-gray-400 font-semibold tracking-wide">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((category) => (
                  <TableRow 
                    key={category.id} 
                    className="border-border/50 hover:bg-white/5 transition-colors cursor-pointer group"
                    onClick={() => openViewCategoryModal(category)}
                  >
                    <TableCell className="font-medium text-white">{category.name}</TableCell>
                    <TableCell className="text-gray-400 text-sm truncate max-w-xs">{category.description}</TableCell>
                    <TableCell className="text-gray-300">
                      <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 shadow-none border-0 mt-1">
                        {category.sessionCount} Sessions
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button 
                         variant="ghost" 
                         size="icon" 
                         className="w-8 h-8 rounded-full text-gray-500 hover:text-[#f97316] hover:bg-[#f97316]/10 transition-all"
                         onClick={(e) => { e.stopPropagation(); openViewCategoryModal(category); }}
                       >
                          <Eye className="w-4 h-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {!loading && categories.length === 0 && (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <FolderOpen className="h-12 w-12 text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-1">No Categories Found</h3>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* --- VIEW SESSION MODAL --- */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-border/50 text-white sm:max-w-[450px]">
          {viewingSession && (
            <>
              <DialogHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20 font-medium">Session Type</Badge>
                </div>
                <DialogTitle className="text-2xl font-black mt-2 tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {viewingSession.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Manage details and configuration for this session type.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-3">
                   {/* Info Cards */}
                   <div className="p-4 rounded-xl border border-border/50 bg-[#111317]">
                     <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Clock className="w-4 h-4" />
                       <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
                     </div>
                     <p className="text-lg font-bold text-white">{viewingSession.duration} mins</p>
                   </div>
                   <div className="p-4 rounded-xl border border-border/50 bg-[#111317]">
                     <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Dumbbell className="w-4 h-4" />
                       <span className="text-xs font-semibold uppercase tracking-wider">Price</span>
                     </div>
                     <p className="text-lg font-bold text-[#f97316]">£{viewingSession.base_price}</p>
                   </div>
                 </div>                  {/* Capacity Utilization */}
                  <div className="p-4 rounded-xl border border-border/50 bg-[#111317] flex flex-col gap-2">
                     <div className="flex items-center gap-2 text-gray-400 mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-xs font-semibold uppercase tracking-wider">Capacity Limits</span>
                     </div>
                     <div className="flex items-end gap-2">
                       <span className="text-xl font-bold text-white">Up to {viewingSession.capacity || viewingSession.max_slots}</span>
                       <span className="text-sm text-gray-500 mb-0.5">people per slot</span>
                     </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl border border-border/50 bg-[#111317]">
                     <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">Description</span>
                     <p className="text-sm text-gray-200">{viewingSession.description || 'No description provided.'}</p>
                  </div>

                 {/* Current Status */}
                 <div className="p-4 rounded-xl border border-border/50 bg-[#111317] flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-semibold tracking-wider block mb-1">Current Status</span>
                      <div className="flex items-center gap-2 mt-1">
                         {viewingSession.is_active ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <XCircle className="w-5 h-5 text-gray-500" />}
                         <span className="text-white font-bold">{viewingSession.is_active ? 'Active' : 'Draft / Off'}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handleToggleActive}
                      className={viewingSession.is_active 
                        ? 'border-red-500/20 text-red-500 hover:bg-red-500/10 hover:text-red-400'
                        : 'border-green-500/20 text-green-500 hover:bg-green-500/10 hover:text-green-400'
                      }
                    >
                      {viewingSession.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border/50">
                 <Button 
                   className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                   onClick={() => openSessionModal(viewingSession)}
                 >
                   <Edit className="w-4 h-4 mr-2" /> Edit Session
                 </Button>
                 <Button 
                   variant="destructive"
                   className="bg-red-500 hover:bg-red-600 text-white"
                   onClick={() => openDeleteModal('session', viewingSession)}
                 >
                   <Trash2 className="w-4 h-4 mr-2" /> Delete
                 </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- VIEW CATEGORY MODAL --- */}
      <Dialog open={isViewCategoryModalOpen} onOpenChange={setIsViewCategoryModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-border/50 text-white sm:max-w-[450px]">
          {viewingCategory && (
            <>
              <DialogHeader className="mb-4">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20 font-medium">Category</Badge>
                </div>
                <DialogTitle className="text-2xl font-black mt-2 tracking-tight uppercase" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {viewingCategory.name}
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Manage details for this session category.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                 <div className="p-4 rounded-xl border border-border/50 bg-[#111317]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">Description</span>
                    <p className="text-sm text-gray-200">{viewingCategory.description || 'No description provided.'}</p>
                 </div>
                 <div className="p-4 rounded-xl border border-border/50 bg-[#111317]">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block mb-1">Associated Sessions</span>
                    <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 shadow-none border-0 mt-1">
                      {viewingCategory.sessionCount} Sessions
                    </Badge>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-border/50">
                 <Button 
                   className="bg-[#f97316] hover:bg-[#ea580c] text-white"
                   onClick={() => openCategoryModal(viewingCategory)}
                 >
                   <Edit className="w-4 h-4 mr-2" /> Edit Category
                 </Button>
                 <Button 
                   variant="destructive"
                   className="bg-red-500 hover:bg-red-600 text-white"
                   onClick={() => openDeleteModal('category', viewingCategory)}
                 >
                   <Trash2 className="w-4 h-4 mr-2" /> Delete
                 </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* --- ADD / EDIT SESSION MODAL --- */}
      <Dialog open={isSessionModalOpen} onOpenChange={setIsSessionModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-border/50 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {editingSession ? 'Edit Session' : 'Create New Session'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingSession ? 'Make changes to your session offering below.' : 'Add a new session template to your catalog.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="s_name" className="text-gray-300">Session Name *</Label>
              <Input 
                id="s_name" 
                value={sessionFormData.name}
                onChange={(e) => setSessionFormData({...sessionFormData, name: e.target.value})}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="e.g. Extreme HIIT" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category_id" className="text-gray-300">Category *</Label>
              <select 
                id="category_id"
                value={sessionFormData.category_id}
                onChange={(e) => setSessionFormData({...sessionFormData, category_id: e.target.value})}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border/50 bg-[#111317] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Select Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="s_price" className="text-gray-300">Default Price (£) *</Label>
                <Input 
                  id="s_price" 
                  type="number"
                  value={sessionFormData.price}
                  onChange={(e) => setSessionFormData({...sessionFormData, price: e.target.value})}
                  className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                  placeholder="25" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s_duration" className="text-gray-300">Duration (mins)</Label>
                <Input 
                  id="s_duration" 
                  type="number"
                  value={sessionFormData.duration}
                  onChange={(e) => setSessionFormData({...sessionFormData, duration: e.target.value})}
                  className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                  placeholder="60" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="s_slots" className="text-gray-300">Max Slots (Legacy)</Label>
                <Input 
                  id="s_slots" 
                  type="number"
                  value={sessionFormData.slots}
                  onChange={(e) => setSessionFormData({...sessionFormData, slots: e.target.value})}
                  className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                  placeholder="10" 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="s_capacity" className="text-gray-300">Default Capacity</Label>
                <Input 
                  id="s_capacity" 
                  type="number"
                  value={sessionFormData.capacity}
                  onChange={(e) => setSessionFormData({...sessionFormData, capacity: e.target.value})}
                  className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                  placeholder="Auto field" 
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s_description" className="text-gray-300">Description</Label>
              <Input 
                id="s_description" 
                value={sessionFormData.description}
                onChange={(e) => setSessionFormData({...sessionFormData, description: e.target.value})}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="Brief description of the session" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSessionModalOpen(false)} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveSession} className="bg-[#f97316] hover:bg-[#ea580c] text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* --- ADD / EDIT CATEGORY MODAL --- */}
      <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-border/50 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {editingCategory ? 'Update the details for this category.' : 'Add a new category label to group your session types.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="c_name" className="text-gray-300">Category Name *</Label>
              <Input 
                id="c_name" 
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({...categoryFormData, name: e.target.value})}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="c_desc" className="text-gray-300">Description</Label>
              <Input 
                id="c_desc" 
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({...categoryFormData, description: e.target.value})}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCategoryModalOpen(false)} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveCategory} className="bg-[#f97316] hover:bg-[#ea580c] text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- SCHEDULE SESSION MODAL --- */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-border/50 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Schedule New Session
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a specific instance of a session template for your clients to book.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="sched_type" className="text-gray-300">Session Type *</Label>
              <select 
                id="sched_type"
                value={scheduleFormData.session_type_id}
                onChange={(e) => handleScheduleChange('session_type_id', e.target.value)}
                className="flex h-10 w-full items-center justify-between rounded-md border border-border/50 bg-[#111317] px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2"
              >
                <option value="">Select Type...</option>
                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sched_title" className="text-gray-300">Session Title *</Label>
              <Input 
                id="sched_title" 
                value={scheduleFormData.title}
                onChange={(e) => handleScheduleChange('title', e.target.value)}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="e.g. HIIT Morning Blast" 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sched_desc" className="text-gray-300">Description</Label>
              <Input 
                id="sched_desc" 
                value={scheduleFormData.description}
                onChange={(e) => handleScheduleChange('description', e.target.value)}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="Special instructions or info" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sched_date" className="text-gray-300">Date *</Label>
                <Input 
                  id="sched_date" 
                  type="date"
                  value={scheduleFormData.date}
                  onChange={(e) => handleScheduleChange('date', e.target.value)}
                  className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sched_time" className="text-gray-300">Time *</Label>
                <Input 
                  id="sched_time" 
                  type="time"
                  value={scheduleFormData.time}
                  onChange={(e) => handleScheduleChange('time', e.target.value)}
                  className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="sched_capacity" className="text-gray-300">Capacity</Label>
              <Input 
                id="sched_capacity" 
                type="number"
                value={scheduleFormData.capacity}
                onChange={(e) => handleScheduleChange('capacity', e.target.value)}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="Slots available" 
              />
            </div>

            <div className="flex flex-col gap-3 py-2 border-t border-border/10">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-gray-300">Recurring Session</Label>
                  <p className="text-[10px] text-gray-500 font-medium">Automatically create multiple weekly sessions</p>
                </div>
                <Switch 
                  checked={scheduleFormData.is_recurring}
                  onCheckedChange={() => handleScheduleChange('is_recurring', '')}
                />
              </div>

              {scheduleFormData.is_recurring && (
                <div className="grid gap-4 p-3 bg-black/20 rounded-lg border border-border/50 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">Repeat Every</Label>
                      <select 
                        className="flex h-8 w-full rounded-md border border-border/50 bg-[#111317] px-2 py-1 text-xs focus:ring-[#f97316]"
                        value={scheduleFormData.repeat_every}
                        onChange={(e) => handleScheduleChange('repeat_every', e.target.value)}
                      >
                        <option value="1">1 Week</option>
                        <option value="2">2 Weeks</option>
                        <option value="4">4 Weeks</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">Ends By</Label>
                      <select 
                        className="flex h-8 w-full rounded-md border border-border/50 bg-[#111317] px-2 py-1 text-xs focus:ring-[#f97316]"
                        value={scheduleFormData.ends_by}
                        onChange={(e) => handleScheduleChange('ends_by', e.target.value)}
                      >
                        <option value="date">Specific date</option>
                        <option value="count">After X times</option>
                      </select>
                    </div>
                  </div>

                  {scheduleFormData.ends_by === 'date' ? (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">End Date</Label>
                      <Input 
                        type="date"
                        className="bg-[#111317] border-border/50 h-8 text-xs"
                        value={scheduleFormData.end_date}
                        onChange={(e) => handleScheduleChange('end_date', e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <Label className="text-[10px] uppercase font-bold text-gray-400">Total Sessions</Label>
                      <Input 
                        type="number"
                        className="bg-[#111317] border-border/50 h-8 text-xs"
                        value={scheduleFormData.total_sessions}
                        onChange={(e) => handleScheduleChange('total_sessions', e.target.value)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid gap-2 border-t border-border/10 pt-2">
              <Label htmlFor="price_override" className="text-gray-300">Custom Price Override (£) <span className="text-[10px] text-gray-500">(Optional)</span></Label>
              <Input 
                id="price_override" 
                type="number"
                value={scheduleFormData.price_override}
                onChange={(e) => handleScheduleChange('price_override', e.target.value)}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="Leave blank to use base price" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Cancel</Button>
            <Button onClick={handleSaveSchedule} className="bg-[#f97316] hover:bg-[#ea580c] text-white">Schedule Session</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-red-500/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Trash2 className="w-5 h-5" /> Delete {deletingEntity?.type === 'session' ? 'Session Template' : deletingEntity?.type === 'category' ? 'Category' : 'Scheduled Session'}
            </DialogTitle>
            <DialogDescription className="text-gray-400 pt-2">
              Are you sure you want to delete <strong className="text-white">{deletingEntity?.data?.name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white">Keep</Button>
            <Button onClick={handleDelete} variant="destructive" className="bg-red-500 hover:bg-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]">
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
