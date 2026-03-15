import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Clock, Filter, Search, ArrowUpDown, Eye, Wallet, Contact, Folder, CalendarDays, User } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

type SortField = 'client' | 'session' | 'date' | 'price' | 'status';
type SortDirection = 'asc' | 'desc';

export default function Bookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sessionFilter, setSessionFilter] = useState<string>('all');
  // Date filter types: 'all', 'today', 'week', 'month', 'custom'
  const [dateFilterType, setDateFilterType] = useState<string>('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Sorting State
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Modal State
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          booking_datetime,
          status,
          created_at,
          profiles (
            id,
            first_name,
            last_name,
            phone_number
          ),
          session_types (
            id,
            name,
            duration,
            base_price,
            location
          )
        `);

      if (error) throw error;
      setBookings(data || []);
    } catch (error: any) {
      toast.error('Failed to load bookings: ' + error.message);
      console.error('Bookings fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Derive unique session types from bookings for the filter dropdown
  const uniqueSessions = useMemo(() => {
    const sessions = new Map();
    bookings.forEach(b => {
      if (b.session_types) {
        sessions.set(b.session_types.id, b.session_types.name);
      }
    });
    return Array.from(sessions.entries()).map(([id, name]) => ({ id, name }));
  }, [bookings]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedBookings = useMemo(() => {
    // 1. Filter
    let filtered = bookings.filter(b => {
       // Search Filter
       if (searchQuery) {
          const clientName = b.profiles ? `${b.profiles.first_name} ${b.profiles.last_name}`.toLowerCase() : '';
          const sessionName = b.session_types?.name?.toLowerCase() || '';
          const q = searchQuery.toLowerCase();
          if (!clientName.includes(q) && !sessionName.includes(q)) return false;
       }

      // Status Filter
      if (statusFilter !== 'all' && b.status.toLowerCase() !== statusFilter) return false;
      
      // Session Filter
      if (sessionFilter !== 'all' && b.session_types?.id !== sessionFilter) return false;

      // Date Filter
      if (dateFilterType !== 'all') {
        const bDate = new Date(b.booking_datetime);
        const now = new Date();
        
        if (dateFilterType === 'today') {
           if (!isWithinInterval(bDate, { start: startOfDay(now), end: endOfDay(now) })) return false;
        } else if (dateFilterType === 'week') {
           if (!isWithinInterval(bDate, { start: startOfWeek(now, {weekStartsOn: 1}), end: endOfWeek(now, {weekStartsOn: 1}) })) return false;
        } else if (dateFilterType === 'month') {
           if (!isWithinInterval(bDate, { start: startOfMonth(now), end: endOfMonth(now) })) return false;
        } else if (dateFilterType === 'custom') {
           if (dateRange.start && bDate < new Date(dateRange.start)) return false;
           // Add 1 day to end date to make it inclusive of the whole day
           if (dateRange.end) {
             const endD = new Date(dateRange.end);
             endD.setHours(23, 59, 59, 999);
             if (bDate > endD) return false;
           }
        }
      }

      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'client') {
         const nameA = a.profiles ? `${a.profiles.first_name} ${a.profiles.last_name}` : '';
         const nameB = b.profiles ? `${b.profiles.first_name} ${b.profiles.last_name}` : '';
         comparison = nameA.localeCompare(nameB);
      } else if (sortField === 'session') {
         const sessA = a.session_types?.name || '';
         const sessB = b.session_types?.name || '';
         comparison = sessA.localeCompare(sessB);
      } else if (sortField === 'date') {
         comparison = new Date(a.booking_datetime).getTime() - new Date(b.booking_datetime).getTime();
      } else if (sortField === 'price') {
         const priceA = a.session_types?.base_price || 0;
         const priceB = b.session_types?.base_price || 0;
         comparison = priceA - priceB;
      } else if (sortField === 'status') {
         comparison = a.status.localeCompare(b.status);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [bookings, searchQuery, statusFilter, sessionFilter, dateFilterType, dateRange, sortField, sortDirection]);

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 shadow-none border border-green-500/20 px-3 py-1 text-xs">Confirmed</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 shadow-none border border-blue-500/20 px-3 py-1 text-xs">Completed</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 hover:bg-red-500/20 shadow-none border border-red-500/20 px-3 py-1 text-xs">Cancelled</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500/10 text-orange-500 hover:bg-orange-500/20 shadow-none border border-orange-500/20 px-3 py-1 text-xs">Pending</Badge>;
      default:
        return <Badge className="bg-gray-500/10 text-gray-500 hover:bg-gray-500/20 shadow-none border border-gray-500/20 px-3 py-1 text-xs">{status}</Badge>;
    }
  };

  const openBookingModal = (booking: any) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Appointment Ledger</h1>
        <p className="text-sm text-gray-400">Oversee all scheduled sessions, manage client attendance, and track payment status.</p>
      </div>

      {/* Main Ledger Container */}
      <div className="rounded-xl border border-border/50 bg-[#1A1D24] shadow-xl overflow-hidden flex flex-col">
        
        {/* Ledger Top Bar */}
        <div className="flex flex-col gap-4 p-5 bg-[#181A20] border-b border-border/50">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div className="flex items-center gap-2 text-white font-medium">
               <Wallet className="w-5 h-5 text-[#f97316]" />
               Booking Ledger ({processedBookings.length})
             </div>
             <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search bookings..."
                  className="pl-9 bg-[#111317] border-border/50 focus-visible:ring-[#f97316] text-sm h-10 w-full rounded-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
             </div>
           </div>

           {/* Filter Controls */}
           <div className="flex flex-wrap items-center gap-3 pt-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] bg-[#111317] border-border/50 text-gray-300 h-9 rounded-lg">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D24] border-border/50">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sessionFilter} onValueChange={setSessionFilter}>
                <SelectTrigger className="w-[180px] bg-[#111317] border-border/50 text-gray-300 h-9 rounded-lg">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="bg-[#1A1D24] border-border/50">
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueSessions.map(session => (
                    <SelectItem key={session.id} value={session.id}>{session.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="w-px h-5 bg-border/50 mx-2 hidden sm:block"></div>

              {/* Date Presets (Screenshot Style) */}
              <div className="flex items-center bg-[#111317] rounded-lg border border-border/50 overflow-hidden h-9">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateFilterType('all')}
                  className={`px-4 h-full rounded-none font-medium text-xs ${dateFilterType === 'all' ? 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  All
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateFilterType('today')}
                  className={`px-3 h-full rounded-none font-medium text-xs flex gap-1.5 items-center ${dateFilterType === 'today' ? 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <CalendarDays className="w-3.5 h-3.5" /> Today
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateFilterType('week')}
                  className={`px-3 h-full rounded-none font-medium text-xs flex gap-1.5 items-center ${dateFilterType === 'week' ? 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <Clock className="w-3.5 h-3.5" /> Week
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setDateFilterType('month')}
                  className={`px-3 h-full rounded-none font-medium text-xs flex gap-1.5 items-center ${dateFilterType === 'month' ? 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                >
                  <CalendarIcon className="w-3.5 h-3.5" /> Month
                </Button>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => { if (dateFilterType !== 'custom') setDateFilterType('custom') }}
                      className={`px-3 h-full rounded-none font-medium text-xs flex gap-1.5 items-center ${dateFilterType === 'custom' ? 'bg-[#f97316] text-white hover:bg-[#ea580c] hover:text-white' : 'text-gray-400 hover:text-white hover:bg-white/5 border-l border-border/50'}`}
                    >
                      <Search className="w-3.5 h-3.5" /> Custom
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 bg-[#1A1D24] border-border/50 p-4" align="end">
                    <div className="space-y-4">
                      <h4 className="font-medium text-white text-sm">Custom Date Range</h4>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-10">Start:</span>
                          <Input 
                            type="date" 
                            className="bg-[#111317] border-border/50 text-sm h-8 cursor-text"
                            value={dateRange.start}
                            onChange={(e) => {
                              setDateRange(p => ({...p, start: e.target.value}));
                              setDateFilterType('custom');
                            }}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400 w-10">End:</span>
                          <Input 
                            type="date" 
                            className="bg-[#111317] border-border/50 text-sm h-8 cursor-text"
                            value={dateRange.end}
                            onChange={(e) => {
                              setDateRange(p => ({...p, end: e.target.value}));
                              setDateFilterType('custom');
                            }}
                          />
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full h-8 text-xs border-gray-600 bg-transparent text-gray-300 hover:text-white hover:bg-white/5"
                        onClick={() => {
                          setDateRange({start: '', end: ''});
                          setDateFilterType('all');
                        }}
                      >
                        Clear Custom Dates
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
           </div>
        </div>

        
        {/* Table Area */}
        <div className="flex-1 overflow-x-auto min-h-[400px]">
          <Table className="w-full">
            <TableHeader className="bg-transparent border-b border-border/50">
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead 
                  className="text-gray-400 font-semibold tracking-wide cursor-pointer py-4"
                  onClick={() => toggleSort('client')}
                >
                  <div className="flex items-center gap-2">
                    Client {sortField === 'client' && <ArrowUpDown className="w-3 h-3 text-gray-500" />}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-400 font-semibold tracking-wide cursor-pointer py-4"
                  onClick={() => toggleSort('session')}
                >
                  <div className="flex items-center gap-2">
                    Session {sortField === 'session' && <ArrowUpDown className="w-3 h-3 text-gray-500" />}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-400 font-semibold tracking-wide cursor-pointer py-4"
                  onClick={() => toggleSort('date')}
                >
                  <div className="flex items-center gap-2">
                    Date {sortField === 'date' && <ArrowUpDown className="w-3 h-3 text-gray-500" />}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-400 font-semibold tracking-wide cursor-pointer py-4"
                  onClick={() => toggleSort('price')}
                >
                  <div className="flex items-center gap-2">
                    Price {sortField === 'price' && <ArrowUpDown className="w-3 h-3 text-gray-500" />}
                  </div>
                </TableHead>
                <TableHead 
                  className="text-gray-400 font-semibold tracking-wide cursor-pointer py-4"
                  onClick={() => toggleSort('status')}
                >
                   <div className="flex items-center gap-2">
                     Status {sortField === 'status' && <ArrowUpDown className="w-3 h-3 text-gray-500" />}
                   </div>
                </TableHead>
                <TableHead className="text-right text-gray-400 font-semibold tracking-wide py-4 pr-6">
                   Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 text-gray-500 border-b border-border/50">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <div className="w-6 h-6 rounded-full border-2 border-[#f97316] border-t-transparent animate-spin"></div>
                      <span className="text-sm">Loading ledger...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : processedBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-20 border-b border-border/50">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <CalendarDays className="w-10 h-10 text-gray-600" />
                      <span className="text-gray-400">No bookings match the selected filters.</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                processedBookings.map((booking) => (
                  <TableRow 
                    key={booking.id} 
                    className="border-b border-border/50 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                    onClick={() => openBookingModal(booking)}
                  >
                    <TableCell className="font-medium text-white py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-500" />
                        <span className="font-semibold text-gray-200">
                          {booking.profiles ? `${booking.profiles.first_name} ${booking.profiles.last_name}` : 'Unknown Client'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300 py-4">
                      <Badge className="bg-white/5 border border-border/50 text-gray-300 hover:bg-white/10 font-normal">
                         {booking.session_types?.name || 'Unknown Session'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300 py-4">
                      <div className="flex flex-col">
                        <span className="text-gray-200 text-sm font-medium">
                          {new Date(booking.booking_datetime).toLocaleString('en-GB', {
                            month: 'short',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        <span className="text-gray-500 text-xs mt-0.5 italic">
                           Booked {new Date(booking.created_at).toLocaleString('en-GB', { month: 'short', day: '2-digit'})}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white py-4 font-medium">
                       £{(booking.session_types?.base_price || 0).toFixed(2)}
                    </TableCell>
                    <TableCell className="py-4">
                      {getStatusBadge(booking.status)}
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="w-8 h-8 rounded-full text-gray-500 hover:text-[#f97316] hover:bg-[#f97316]/10 opacity-0 group-hover:opacity-100 transition-all"
                        onClick={(e) => { e.stopPropagation(); openBookingModal(booking); }}
                      >
                         <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- BOOKING VIEW MODAL --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#1A1D24] border-border/50 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <CalendarDays className="w-5 h-5 text-[#f97316]" /> Booking Details
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Complete information regarding this booking.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6 py-4">
              
              {/* Status Banner */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 border border-border/50">
                 <div className="flex flex-col">
                   <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Current Status</span>
                   {getStatusBadge(selectedBooking.status)}
                 </div>
                 <div className="text-right flex flex-col items-end">
                   <span className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Booking Ref</span>
                   <span className="text-xs text-gray-300 font-mono bg-[#111317] px-2 py-1 rounded">{selectedBooking.id.split('-')[0]}</span>
                 </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                 {/* Client Info */}
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <h4 className="flex items-center gap-2 text-sm font-semibold text-white border-b border-border/50 pb-2">
                     <Contact className="w-4 h-4 text-gray-400" /> Client
                   </h4>
                   {selectedBooking.profiles ? (
                     <div className="text-sm">
                       <p className="text-white font-medium">{selectedBooking.profiles.first_name} {selectedBooking.profiles.last_name}</p>
                       {selectedBooking.profiles.phone_number && <p className="text-gray-400 text-xs mt-0.5">{selectedBooking.profiles.phone_number}</p>}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 italic">Unknown Client</p>
                   )}
                 </div>

                 {/* Session Info */}
                 <div className="col-span-2 sm:col-span-1 space-y-2">
                   <h4 className="flex items-center gap-2 text-sm font-semibold text-white border-b border-border/50 pb-2">
                     <Folder className="w-4 h-4 text-gray-400" /> Session
                   </h4>
                   {selectedBooking.session_types ? (
                     <div className="text-sm">
                       <p className="text-[#f97316] font-medium">{selectedBooking.session_types.name}</p>
                       <p className="text-gray-400 text-xs mt-0.5">{selectedBooking.session_types.duration} mins • £{selectedBooking.session_types.base_price}</p>
                       {selectedBooking.session_types.location && <p className="text-gray-400 text-xs mt-0.5">📍 {selectedBooking.session_types.location}</p>}
                     </div>
                   ) : (
                     <p className="text-sm text-gray-500 italic">Unknown Session</p>
                   )}
                 </div>

                 {/* Timing Info */}
                 <div className="col-span-2 space-y-2">
                   <h4 className="flex items-center gap-2 text-sm font-semibold text-white border-b border-border/50 pb-2">
                     <Clock className="w-4 h-4 text-gray-400" /> Schedule
                   </h4>
                   <div className="flex flex-col gap-1 text-sm bg-[#111317] rounded-md p-3 border border-border/50">
                     <div className="flex justify-between">
                       <span className="text-gray-400">Date & Time:</span>
                       <span className="text-white font-medium">
                         {new Date(selectedBooking.booking_datetime).toLocaleString([], {
                           weekday: 'long',
                           year: 'numeric',
                           month: 'long',
                           day: 'numeric',
                           hour: '2-digit',
                           minute: '2-digit'
                         })}
                       </span>
                     </div>
                     <div className="flex justify-between border-t border-border/50 pt-2 mt-1">
                       <span className="text-gray-400">Booked On:</span>
                       <span className="text-gray-400">
                         {new Date(selectedBooking.created_at).toLocaleString([], {
                            dateStyle: 'medium', timeStyle: 'short'
                         })}
                       </span>
                     </div>
                   </div>
                 </div>
              </div>

            </div>
          )}
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
             <Button variant="outline" className="bg-transparent border-gray-600 text-gray-300 hover:bg-white/5" onClick={() => setIsModalOpen(false)}>
               Close
             </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
