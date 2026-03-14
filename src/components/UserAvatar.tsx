import React, { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface UserAvatarProps {
  avatarPath?: string;
  name?: string;
  email?: string;
  className?: string;
}

export function UserAvatar({ avatarPath, name, email, className }: UserAvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { role } = useAuth();

  useEffect(() => {
    if (!avatarPath) {
      setAvatarUrl(null);
      return;
    }

    if (avatarPath.startsWith('http') || avatarPath.startsWith('data:')) {
      setAvatarUrl(avatarPath);
      return;
    }

    const downloadImage = async () => {
      try {
        const { data, error } = await supabase.storage.from('avatars').download(avatarPath);
        if (error) {
          throw error;
        }
        if (data) {
          const url = URL.createObjectURL(data);
          setAvatarUrl(url);
        }
      } catch (error) {
        console.error('Error downloading image: ', error);
      }
    };

    downloadImage();
  }, [avatarPath]);

  const getInitials = () => {
    if (name) {
      const parts = name.split(' ');
      if (parts[0].length >= 2) return parts[0].substring(0, 2).toUpperCase();
      if (parts[0].length === 1) return parts[0].toUpperCase();
    }
    return email?.substring(0, 2).toUpperCase() || "U";
  };

  const defaultAvatar = role === 'admin' ? '/admin-avatar.svg' : '/default-avatar.png';

  return (
    <Avatar className={className}>
      <AvatarImage src={avatarUrl || defaultAvatar} />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
