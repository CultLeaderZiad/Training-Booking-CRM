import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { UserAvatar } from '../../components/UserAvatar';
import { Camera, MapPin, Phone, Mail, User, Loader2 } from 'lucide-react';
import { useRef } from 'react';

export default function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<any>({
    first_name: '',
    last_name: '',
    phone_prefix: '+44',
    phone_number: '',
    address_line1: '',
    address_line2: '',
    city: '',
    county: '',
    post_code: '',
    country: 'United Kingdom',
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;
      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_prefix: data.phone_prefix || '+44',
          phone_number: data.phone_number || '',
          address_line1: data.address_line1 || '',
          address_line2: data.address_line2 || '',
          city: data.city || '',
          county: data.county || '',
          post_code: data.post_code || '',
          country: data.country || 'United Kingdom',
        });
      }
    } catch (error: any) {
      toast.error('Error fetching profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone_prefix: profile.phone_prefix,
          phone_number: profile.phone_number,
          address_line1: profile.address_line1,
          address_line2: profile.address_line2,
          city: profile.city,
          county: profile.county,
          post_code: profile.post_code,
          country: profile.country,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update profile: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });

      if (updateError) throw updateError;

      // Update profile table as well
      await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user?.id);

      toast.success('Profile picture updated!');
      if (refreshUser) refreshUser();
    } catch (error: any) {
      toast.error('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f97316]"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header / Avatar */}
      <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <UserAvatar 
              avatarPath={user?.user_metadata?.avatar_url} 
              name={user?.user_metadata?.full_name} 
              className="w-24 h-24 border-2 border-border/50 shadow-xl"
            />
            <button 
              type="button"
              onClick={handleAvatarClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 p-2 bg-[#f97316] rounded-full text-white shadow-lg group-hover:scale-110 transition-transform flex items-center justify-center min-w-[32px] min-h-[32px]"
            >
               {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
            </button>
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
         <div className="text-center md:text-left">
            <h1 className="text-2xl font-black text-white uppercase tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {profile.first_name} {profile.last_name || 'Member'}
            </h1>
            <p className="text-sm text-gray-500 font-medium">{user?.email}</p>
            <div className="mt-2 text-[10px] bg-[#f97316]/10 text-[#f97316] font-black uppercase tracking-widest px-2 py-1 rounded inline-block">User</div>
         </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Details */}
        <div className="bg-[#1A1D24] border border-border/50 rounded-3xl p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
           <h2 className="text-lg font-black text-white uppercase tracking-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Profile Details</h2>
           <p className="text-xs text-gray-500 mb-8">Manage your personal information and account settings.</p>

           <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                   <User className="w-3 h-3 text-[#f97316]" /> First Name
                 </Label>
                 <Input 
                   value={profile.first_name}
                   onChange={e => setProfile({...profile, first_name: e.target.value})}
                   className="bg-black/20 border-border/50 h-12 rounded-xl text-white focus:border-[#f97316]/50 transition-all font-medium" 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3 text-[#f97316]" /> Last Name
                 </Label>
                 <Input 
                   value={profile.last_name}
                   onChange={e => setProfile({...profile, last_name: e.target.value})}
                   className="bg-black/20 border-border/50 h-12 rounded-xl text-white focus:border-[#f97316]/50 transition-all font-medium" 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Prefix</Label>
                 <Input 
                   value={profile.phone_prefix}
                   onChange={e => setProfile({...profile, phone_prefix: e.target.value})}
                   className="bg-black/20 border-border/50 h-12 rounded-xl text-white font-medium" 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <Phone className="w-3 h-3 text-[#f97316]" /> Phone Number
                 </Label>
                 <Input 
                   value={profile.phone_number}
                   onChange={e => setProfile({...profile, phone_number: e.target.value})}
                   placeholder="7123 456789"
                   className="bg-black/20 border-border/50 h-12 rounded-xl text-white font-medium" 
                 />
              </div>
           </div>
        </div>

        {/* Address Details */}
        <div className="bg-[#1A1D24] border border-border/50 rounded-3xl p-8 relative overflow-hidden">
           <div className="absolute top-0 left-0 w-1 h-full bg-[#f97316]" />
           <h2 className="text-lg font-black text-white uppercase tracking-tight mb-2" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Address Details</h2>
           <p className="text-xs text-gray-500 mb-8">Your location information for session scheduling.</p>

           <div className="space-y-6">
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-[#f97316]" /> Address Line 1
                 </Label>
                 <Input 
                   value={profile.address_line1}
                   onChange={e => setProfile({...profile, address_line1: e.target.value})}
                   placeholder="Street address or P.O. box"
                   className="bg-black/20 border-border/50 h-12 rounded-xl text-white font-medium" 
                 />
              </div>
              <div className="space-y-2">
                 <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Address Line 2 (Optional)</Label>
                 <Input 
                   value={profile.address_line2}
                   onChange={e => setProfile({...profile, address_line2: e.target.value})}
                   placeholder="Apartment, suite, unit, building, floor, etc."
                   className="bg-black/20 border-border/50 h-12 rounded-xl text-white font-medium" 
                 />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">City</Label>
                    <Input 
                      value={profile.city}
                      onChange={e => setProfile({...profile, city: e.target.value})}
                      className="bg-black/20 border-border/50 h-12 rounded-xl text-white" 
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">County / State</Label>
                    <Input 
                      value={profile.county}
                      onChange={e => setProfile({...profile, county: e.target.value})}
                      className="bg-black/20 border-border/50 h-12 rounded-xl text-white" 
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Post Code</Label>
                    <Input 
                      value={profile.post_code}
                      onChange={e => setProfile({...profile, post_code: e.target.value})}
                      className="bg-black/20 border-border/50 h-12 rounded-xl text-white uppercase font-mono" 
                    />
                 </div>
                 <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Country</Label>
                    <Input 
                      value={profile.country}
                      onChange={e => setProfile({...profile, country: e.target.value})}
                      className="bg-black/20 border-border/50 h-12 rounded-xl text-white" 
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Email Area */}
        <div className="bg-black/40 border border-border/50 rounded-3xl p-8">
           <div className="space-y-2 opacity-60">
              <Label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2">
                 <Mail className="w-3 h-3" /> Email Address
              </Label>
              <Input 
                value={user?.email || ''} 
                disabled 
                className="bg-transparent border-border/50 h-12 rounded-xl text-gray-400 cursor-not-allowed" 
              />
              <p className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">Email cannot be changed currently.</p>
           </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 pb-12">
           <Button 
             type="submit" 
             disabled={saving}
             className="bg-[#f97316] hover:bg-[#ea580c] text-white px-10 h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-[#f97316]/20"
           >
              {saving ? 'SAVING CHANGES...' : 'SAVE ALL DETAILS'}
           </Button>
        </div>
      </form>
    </div>
  );
}
