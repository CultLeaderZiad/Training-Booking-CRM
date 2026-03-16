import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get('sessionId');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Pass user metadata to be captured by the Supabase trigger
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signup successful! Check your email to verify.');
      navigate(`/login${sessionId ? `?sessionId=${sessionId}` : ''}`, { state: location.state });
    }
    
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#0E1113] p-4 text-white">
      <div className="w-full max-w-md p-8 pt-10 pb-8 space-y-8 rounded-2xl border border-zinc-800 bg-[#151718] text-white shadow-xl">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">Create an Account</h1>
          <p className="text-sm text-zinc-400">Join the elite club of session bookers</p>
        </div>
        
        <form onSubmit={handleSignup} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-zinc-300 font-semibold mb-1">First Name</Label>
              <Input 
                id="firstName" 
                placeholder="John"
                className="bg-[#0E1113] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary"
                required 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-zinc-300 font-semibold mb-1">Last Name</Label>
              <Input 
                id="lastName" 
                placeholder="Doe"
                className="bg-[#0E1113] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary"
                required 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-zinc-300 font-semibold mb-1">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              className="bg-[#0E1113] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary"
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-zinc-300 font-semibold mb-1">Password</Label>
            <Input 
              id="password" 
              type="password" 
              className="bg-[#0E1113] border-zinc-800 text-white placeholder:text-zinc-600 focus-visible:ring-primary focus-visible:border-primary"
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full font-bold text-base py-5 h-auto mt-2" disabled={loading}>
            {loading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="text-center text-sm text-zinc-400 pt-2">
          Already have an account?{' '}
          <Link 
            to={`/login${sessionId ? `?sessionId=${sessionId}` : ''}`} 
            state={location.state}
            className="text-primary hover:text-primary/90 font-semibold hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
