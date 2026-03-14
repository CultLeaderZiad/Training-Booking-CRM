import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { UserAvatar } from '../../components/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function Profile() {
  const { user, signOut, role } = useAuth();
  const navigate = useNavigate();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phonePrefix, setPhonePrefix] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [county, setCounty] = useState('');
  const [postCode, setPostCode] = useState('');
  const [country, setCountry] = useState('');

  const [avatarPath, setAvatarPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      if (data) {
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
        setPhonePrefix(data.phone_prefix || '');
        setPhoneNumber(data.phone_number || '');
        setAddressLine1(data.address_line1 || '');
        setAddressLine2(data.address_line2 || '');
        setCity(data.city || '');
        setCounty(data.county || '');
        setPostCode(data.post_code || '');
        setCountry(data.country || '');
        setAvatarPath(data.avatar_url || '');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSave = async () => {
    setLoading(true);
    let finalPath = avatarPath;

    if (file && user) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        toast.error("Error uploading image");
        setLoading(false);
        return;
      }
      finalPath = filePath;
      setAvatarPath(filePath);
    }

    try {
      const { error } = await supabase.from('profiles').update({
        first_name: firstName,
        last_name: lastName,
        phone_prefix: phonePrefix,
        phone_number: phoneNumber,
        address_line1: addressLine1,
        address_line2: addressLine2,
        city: city,
        county: county,
        post_code: postCode,
        country: country,
        avatar_url: finalPath
      }).eq('id', user?.id);

      if (error) throw error;

      // Optionally sync to user metadata for compatibility if needed
      await supabase.auth.updateUser({
        data: { full_name: `${firstName} ${lastName}`.trim(), avatar_url: finalPath }
      });
      
      toast.success("Profile updated successfully!");
      setFile(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111317] p-8 text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <UserAvatar 
              avatarPath={file ? URL.createObjectURL(file) : avatarPath} 
              name={`${firstName} ${lastName}`.trim() || user?.email || ""} 
              email={user?.email} 
              className="h-16 w-16" 
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'User Profile'}
              </h1>
              <div className="flex items-center gap-2 text-sm mt-2">
                <span className="text-[#f97316] font-semibold uppercase tracking-wider text-[10px] border border-[#f97316]/30 bg-[#f97316]/10 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f97316]"></span>
                  {role?.toUpperCase() || 'USER'}
                </span>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-red-900/30 bg-transparent text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors cursor-pointer" onClick={handleLogout}>
            Sign Out
          </Button>
        </header>

        {/* Profile Card */}
        <div className="p-8 rounded-xl border border-border/50 bg-[#1A1D24] shadow-2xl flex flex-col md:flex-row gap-8">
          
          <div className="flex flex-col items-center md:items-start gap-4 md:border-r md:border-border/30 pr-0 md:pr-8 md:w-48 shrink-0">
            <div className="relative group w-32 h-32 rounded-full overflow-hidden border-4 border-[#111317]">
              <UserAvatar 
                avatarPath={file ? URL.createObjectURL(file) : avatarPath} 
                name={`${firstName} ${lastName}`.trim() || user?.email || ""} 
                email={user?.email} 
                className="w-full h-full object-cover" 
              />
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setFile(e.target.files[0]);
                  }
                }}
              />
              <label 
                htmlFor="avatar-upload" 
                className="absolute inset-x-0 bottom-0 h-10 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white"
              >
                <Upload className="w-4 h-4 text-white/80" />
              </label>
            </div>
          </div>
          
          <div className="space-y-6 flex-1 w-full">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Profile Details</h2>
              <p className="text-sm text-gray-400 mt-1">Manage your personal information and account settings.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">First Name</label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="e.g. John" 
                    className="w-full text-white bg-black/40 pl-9 pr-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Last Name</label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="e.g. Doe" 
                    className="w-full text-white bg-black/40 pl-9 pr-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 sm:col-span-4 lg:col-span-3">
                <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Prefix</label>
                <input 
                  type="text" 
                  value={phonePrefix}
                  onChange={(e) => setPhonePrefix(e.target.value)}
                  placeholder="+44" 
                  className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20 text-center sm:text-left"
                />
              </div>
              <div className="col-span-12 sm:col-span-8 lg:col-span-9">
                <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Phone Number</label>
                <input 
                  type="text" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="7123 456789" 
                  className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4">Address Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Address Line 1</label>
                  <input 
                    type="text" 
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="Street address or P.O. box" 
                    className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Address Line 2 (Optional)</label>
                  <input 
                    type="text" 
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Apartment, suite, unit, building, floor, etc." 
                    className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">City</label>
                    <input 
                      type="text" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="London" 
                      className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">County / State</label>
                    <input 
                      type="text" 
                      value={county}
                      onChange={(e) => setCounty(e.target.value)}
                      placeholder="London" 
                      className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Post Code</label>
                    <input 
                      type="text" 
                      value={postCode}
                      onChange={(e) => setPostCode(e.target.value)}
                      placeholder="Post code" 
                      className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Country</label>
                    <input 
                      type="text" 
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="UK" 
                      className="w-full text-white bg-black/40 px-4 py-2.5 rounded-lg border border-white/5 focus:border-[#f97316]/50 focus:ring-1 focus:ring-[#f97316]/50 outline-none transition-all placeholder:text-white/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <label className="text-xs font-bold text-gray-300 mb-1.5 block drop-shadow-sm">Email Address</label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                <div className="w-full text-white/40 bg-black/20 pl-9 pr-4 py-2.5 rounded-lg border border-white/5 cursor-not-allowed select-none">
                  {user?.email || 'N/A'}
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2 font-medium">Email cannot be changed currently.</p>
            </div>

            <div className="pt-8">
              <Button onClick={handleSave} disabled={loading} className="w-full bg-[#f97316] hover:bg-[#ea580c] text-white font-semibold py-6 rounded-lg shadow-[0_0_20px_rgba(249,115,22,0.15)] hover:shadow-[0_0_25px_rgba(249,115,22,0.25)] transition-all border border-[#f97316]/20 cursor-pointer">
                {loading ? 'Saving Changes...' : (
                  <span className="flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    Save Changes
                  </span>
                )}
              </Button>
            </div>
            
          </div>
        </div>

      </div>
    </div>
  );
}
