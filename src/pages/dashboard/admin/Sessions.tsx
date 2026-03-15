import React, { useState, useEffect } from 'react';
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
  MoreHorizontal
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Badge } from "../../../components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import { supabase } from '@/lib/supabase';

export default function Sessions() {
  const [activeTab, setActiveTab] = useState('types');
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
  
  // Holds data for the Currently Editing entities
  const [viewingSession, setViewingSession] = useState<any>(null);
  const [viewingCategory, setViewingCategory] = useState<any>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingEntity, setDeletingEntity] = useState<{type: 'session' | 'category', data: any} | null>(null);

  const [sessionFormData, setSessionFormData] = useState({ name: '', category_id: '', price: '', duration: '', slots: '' });
  const [categoryFormData, setCategoryFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catRes, sesRes] = await Promise.all([
        supabase.from('session_categories').select('*').order('created_at', { ascending: false }),
        supabase.from('session_types').select('*, session_categories(name)').order('created_at', { ascending: false })
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
      });
    } else {
      setEditingSession(null);
      setSessionFormData({ name: '', category_id: categories[0]?.id || '', price: '', duration: '', slots: '' });
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

  // --- Delete Logic ---
  const openDeleteModal = (type: 'session' | 'category', data: any) => {
    setIsViewModalOpen(false);
    setIsViewCategoryModalOpen(false);
    setDeletingEntity({ type, data });
    setIsDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingEntity) return;
    try {
      if (deletingEntity.type === 'session') {
        const { error } = await supabase.from('session_types').delete().eq('id', deletingEntity.data.id);
        if (error) throw error;
        toast.success('Session deleted.');
      } else {
        const { error } = await supabase.from('session_categories').delete().eq('id', deletingEntity.data.id);
        if (error) throw error;
        toast.success('Category deleted.');
      }
      setIsDeleteModalOpen(false);
      fetchData();
    } catch (error: any) {
      if(error.message.includes('violates foreign key constraint')) {
          toast.error(`Cannot delete category because it has active sessions. Delete sessions first.`);
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
           <Button 
             className="bg-[#f97316] hover:bg-[#ea580c] text-white"
             onClick={() => {
               if(activeTab === 'types') {
                 openSessionModal();
               } else {
                 openCategoryModal();
               }
             }}
           >
             <Plus className="w-4 h-4 mr-2" />
             {activeTab === 'types' ? 'New Session Type' : 'New Category'}
           </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <Tabs defaultValue="types" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-[#1A1D24] border border-border/50">
            <TabsTrigger value="types" className="data-[state=active]:bg-[#f97316] data-[state=active]:text-white">Session Types</TabsTrigger>
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
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Category</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Price</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Duration</TableHead>
                  <TableHead className="text-gray-400 font-semibold tracking-wide">Capacity</TableHead>
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
                    <TableCell>
                      <Badge variant="outline" className="bg-white/5 text-gray-300 border-border/50">
                        {type.categoryName}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">£{type.base_price}</TableCell>
                    <TableCell className="text-gray-300">{type.duration} mins</TableCell>
                    <TableCell className="text-gray-300">{type.max_slots} slots</TableCell>
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
                      <Badge variant="secondary" className="bg-[#f97316]/10 text-[#f97316] hover:bg-[#f97316]/20 shadow-none border-0">
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
                 </div>

                 {/* Capacity Utilization */}
                 <div className="p-4 rounded-xl border border-border/50 bg-[#111317] flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-gray-400 mb-1">
                       <Users className="w-4 h-4" />
                       <span className="text-xs font-semibold uppercase tracking-wider">Capacity Limits</span>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="text-xl font-bold text-white">Up to {viewingSession.max_slots}</span>
                      <span className="text-sm text-gray-500 mb-0.5">people per slot</span>
                    </div>
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
            <div className="grid gap-2">
              <Label htmlFor="s_slots" className="text-gray-300">Max Capacity</Label>
              <Input 
                id="s_slots" 
                type="number"
                value={sessionFormData.slots}
                onChange={(e) => setSessionFormData({...sessionFormData, slots: e.target.value})}
                className="bg-[#111317] border-border/50 focus-visible:ring-[#f97316]" 
                placeholder="10" 
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

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-red-500/20 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-red-500" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <Trash2 className="w-5 h-5" /> Delete {deletingEntity?.type === 'session' ? 'Session' : 'Category'}
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
