import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { toast } from 'sonner';
import { Search, Plus, User, Eye, Edit, Trash2, Mail, Phone, MapPin, Ban, BarChart, X } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '../../../components/ui/dialog';
import { useAuth } from '../../../contexts/AuthContext';

type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  city: string;
  role: string;
  created_at?: string;
};

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Profile | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Profile>>({});

  // New client form state
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setClients(data || []);
    } catch (error: any) {
      console.error('Error fetching clients:', error);
      toast.error('Failed to load clients data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      toast.info('Info: Note that creating auth users from the client without logging out requires Edge Functions setup.');
      
      const { data: newUser, error: authError } = await supabase.auth.signUp({
        email: newClient.email,
        password: 'TemporaryPassword123!',
        options: {
          data: {
            full_name: `${newClient.firstName} ${newClient.lastName}`.trim()
          }
        }
      });

      if (authError) throw authError;

      if (newUser?.user?.id) {
         await supabase.from('profiles').update({
           first_name: newClient.firstName,
           last_name: newClient.lastName,
           phone_number: newClient.phone,
           role: 'client'
         }).eq('id', newUser.user.id);
      }

      toast.success('Client added successfully. Admin session might be cleared.');
      setIsAddOpen(false);
      fetchClients();
      
      setNewClient({ firstName: '', lastName: '', email: '', phone: '' });
      
    } catch (error: any) {
      console.error('Error adding client:', error);
      toast.error(error.message || 'Failed to add client');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    if (clientId === user?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    const confirm = window.confirm("Are you sure you want to delete this user?");
    if (!confirm) return;

    try {
      toast.info('Deleting user from database (requires service role for Auth delete)');
      // This will only delete from profiles unless RLS allows or we use backend
      const { error } = await supabase.from('profiles').delete().eq('id', clientId);
      if (error) throw error;
      
      toast.success('User deleted successfully (profile).');
      setSelectedClient(null);
      fetchClients();
    } catch(err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleBanClient = async (clientId: string) => {
    if (clientId === user?.id) {
      toast.error("You cannot ban your own account.");
      return;
    }
    const confirm = window.confirm("Are you sure you want to ban this user?");
    if (!confirm) return;

    try {
      const { error } = await supabase.from('profiles').update({ role: 'banned' }).eq('id', clientId);
      if (error) throw error;
      
      toast.success("User banned successfully.");
      if (selectedClient?.id === clientId) {
        setSelectedClient({ ...selectedClient, role: 'banned' });
      }
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || "Failed to ban user");
    }
  };

  const handleEditClick = () => {
    setEditForm({
      first_name: selectedClient?.first_name || '',
      last_name: selectedClient?.last_name || '',
      phone_number: selectedClient?.phone_number || '',
      city: selectedClient?.city || '',
      role: selectedClient?.role || 'user'
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedClient) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          phone_number: editForm.phone_number,
          city: editForm.city,
          role: editForm.role
        })
        .eq('id', selectedClient.id);

      if (error) throw error;
      
      toast.success('User updated successfully');
      setSelectedClient({ ...selectedClient, ...editForm } as Profile);
      setIsEditMode(false);
      fetchClients();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update user');
    }
  };

  const filteredClients = clients.filter(client => {
    const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
    const phone = (client.phone_number || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch = fullName.includes(query) || phone.includes(query);
    
    const matchesRole = roleFilter === 'all' || client.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Clients</h1>
          <p className="text-sm text-gray-400">Manage user roles, profiles, and ban clients.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#f97316] hover:bg-[#ea580c] text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#1A1D24] border border-border/50 text-white sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Fill in the details below to register a new client profile.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClient} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">First Name</label>
                  <input
                    required
                    type="text"
                    value={newClient.firstName}
                    onChange={(e) => setNewClient({...newClient, firstName: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Last Name</label>
                  <input
                    required
                    type="text"
                    value={newClient.lastName}
                    onChange={(e) => setNewClient({...newClient, lastName: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email Address</label>
                <input
                  required
                  type="email"
                  value={newClient.email}
                  onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white"
                />
              </div>
              <div className="pt-4 flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setIsAddOpen(false)} className="hover:bg-white/5">
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#f97316] hover:bg-[#ea580c]">
                  Add Client
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search users by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1D24] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50 transition-colors"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full bg-[#1A1D24] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50 transition-colors appearance-none"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="client">Client</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Data Grid */}
      <div className="rounded-xl border border-border/50 bg-[#1A1D24] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-black/20 text-gray-400">
              <tr>
                <th className="px-6 py-4 font-medium">User Name</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Loading users...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => {
                  const isSelf = client.id === user?.id;
                  return (
                    <tr 
                      key={client.id} 
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                      onClick={() => setSelectedClient(client)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs border ${isSelf ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-[#f97316]/20 text-[#f97316] border-[#f97316]/30'}`}>
                            {client.first_name?.[0] || <User className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-white">{`${client.first_name || ''} ${client.last_name || ''}`.trim() || 'Unknown'}</p>
                              {isSelf && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">You</span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 font-mono">{client.id.split('-')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {client.phone_number || '-'}
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {client.city || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-semibold uppercase border ${client.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : client.role === 'client' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {client.role || 'USER'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center items-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10 group-hover:bg-white/5 opacity-100"
                            onClick={(e) => { e.stopPropagation(); setSelectedClient(client); }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View User Modal */}
      <Dialog open={!!selectedClient} onOpenChange={(open) => {
        if (!open) {
          setSelectedClient(null);
          setIsEditMode(false);
        }
      }}>
        <DialogContent className="bg-[#1A1D24] border border-border/50 text-white sm:max-w-[450px]">
          {selectedClient && (
            <>
              <DialogHeader className="border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#f97316]/20 flex items-center justify-center text-[#f97316] text-xl font-bold border-2 border-[#f97316]/30">
                      {selectedClient.first_name?.[0] || <User className="w-6 h-6" />}
                    </div>
                    <div>
                      <DialogTitle className="text-xl flex items-center gap-2">
                        {`${selectedClient.first_name || ''} ${selectedClient.last_name || ''}`.trim() || 'Unknown'}
                        {selectedClient.id === user?.id && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold uppercase">You</span>
                        )}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-gray-500">
                        View and manage client account details and role.
                      </DialogDescription>
                      <span className={`inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase border ${selectedClient.role === 'admin' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : selectedClient.role === 'client' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                        {selectedClient.role || 'USER'}
                      </span>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="py-4">
                {isEditMode ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">First Name</label>
                        <input
                          type="text"
                          value={editForm.first_name || ''}
                          onChange={(e) => setEditForm({...editForm, first_name: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-300">Last Name</label>
                         <input
                           type="text"
                           value={editForm.last_name || ''}
                           onChange={(e) => setEditForm({...editForm, last_name: e.target.value})}
                           className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50"
                         />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Phone</label>
                        <input
                          type="text"
                          value={editForm.phone_number || ''}
                          onChange={(e) => setEditForm({...editForm, phone_number: e.target.value})}
                          className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50"
                        />
                      </div>
                      <div className="space-y-2">
                         <label className="text-sm font-medium text-gray-300">Role</label>
                         <select
                           value={editForm.role || 'user'}
                           onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                           className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50 appearance-none"
                           disabled={selectedClient.id === user?.id} // Prevent changing own role here simply
                         >
                           <option value="user">User</option>
                           <option value="client">Client</option>
                           <option value="admin">Admin</option>
                           <option value="banned">Banned</option>
                         </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-sm font-medium text-gray-300">Location</label>
                       <input
                         type="text"
                         value={editForm.city || ''}
                         onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                         className="w-full bg-black/40 border border-white/10 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-[#f97316]/50"
                       />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-2 border-t border-border/50">
                      <Button variant="ghost" onClick={() => setIsEditMode(false)} className="hover:bg-white/5 disabled:opacity-50">
                        Cancel
                      </Button>
                      <Button onClick={handleSaveEdit} className="bg-[#f97316] hover:bg-[#ea580c] disabled:opacity-50 text-white">
                        Save Profile
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3 bg-black/20 rounded-lg p-4 border border-white/5">
                       <div className="flex items-center gap-3 text-sm">
                         <Mail className="w-4 h-4 text-gray-500" />
                         <span className="text-gray-300">Email Hidden (Supabase Auth)</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm">
                         <Phone className="w-4 h-4 text-gray-500" />
                         <span className="text-gray-300">{selectedClient.phone_number || '---'}</span>
                       </div>
                       <div className="flex items-center gap-3 text-sm">
                         <MapPin className="w-4 h-4 text-gray-500" />
                         <span className="text-gray-300">{selectedClient.city || '---'}</span>
                       </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Detailed Options</p>
                      <div className="grid grid-cols-2 gap-2">
                         <Button variant="outline" className="w-full justify-start text-sm border-white/10 hover:bg-white/5 hover:text-white" onClick={handleEditClick}>
                           <Edit className="w-4 h-4 mr-2" />
                           Edit Profile
                         </Button>
                         <Button variant="outline" className="w-full justify-start text-sm border-white/10 hover:bg-white/5 hover:text-white" onClick={() => toast.info('Track Details module not active yet.')}>
                           <BarChart className="w-4 h-4 mr-2" />
                           Track Data
                         </Button>
                         {selectedClient.id !== user?.id && selectedClient.role !== 'banned' && (
                           <Button variant="outline" className="w-full justify-start text-sm border-orange-900/30 text-orange-500 hover:bg-orange-500/10 hover:text-orange-400" onClick={() => handleBanClient(selectedClient.id)}>
                             <Ban className="w-4 h-4 mr-2" />
                             Ban User
                           </Button>
                         )}
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/50">
                       <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Danger Zone</p>
                       <Button 
                         variant="outline" 
                         className="w-full border-red-900/50 text-red-500 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-colors"
                         disabled={selectedClient.id === user?.id}
                         onClick={() => handleDeleteClient(selectedClient.id)}
                       >
                         <Trash2 className="w-4 h-4 mr-2" />
                         Delete Account
                       </Button>
                       {selectedClient.id === user?.id && (
                         <p className="text-[10px] text-gray-500 mt-2 text-center">You cannot delete your own account while logged in.</p>
                       )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
