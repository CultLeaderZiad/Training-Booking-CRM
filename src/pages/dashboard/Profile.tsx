import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { UserAvatar } from '../../components/UserAvatar';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

export default function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const [fullName, setFullName] = useState('');
  const [avatarPath, setAvatarPath] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.user_metadata?.full_name || '');
      setAvatarPath(user.user_metadata?.avatar_url || '');
    }
  }, [user]);

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

    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, avatar_url: finalPath }
    });
    
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Profile updated successfully!");
      setFile(null); // Clear selected file after successful save
    }
  };



  return (
    <div className="min-h-screen bg-[#111317] p-8 text-foreground" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>User Profile</h1>
            <p className="text-sm text-gray-400 mt-2">Manage your personal information</p>
          </div>
          <Button variant="outline" className="border-red-900/30 bg-transparent text-red-500 hover:bg-red-900/20 hover:text-red-400 transition-colors" onClick={handleLogout}>
            Sign Out
          </Button>
        </header>

        {/* Profile Card */}
        <div className="p-8 rounded-xl border border-border/50 bg-[#1A1D24] flex flex-col items-center sm:flex-row sm:items-start gap-8">
          <div className="flex flex-col items-center gap-4">
            <UserAvatar 
              avatarPath={file ? URL.createObjectURL(file) : avatarPath} 
              name={fullName} 
              email={user?.email} 
              className="h-24 w-24" 
            />
            <div>
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
                className="cursor-pointer inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Photo
              </label>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 w-full">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <div className="mt-1 text-white/50 bg-black/20 px-4 py-2 rounded-md border border-border/30 cursor-not-allowed">
                {user?.email || 'N/A'}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name" 
                className="mt-1 w-full text-white bg-black/20 px-4 py-2 rounded-md border border-border/30 focus:outline-none focus:border-primary/50" 
              />
            </div>


            
            <div className="pt-4">
              <Button onClick={handleSave} disabled={loading} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
