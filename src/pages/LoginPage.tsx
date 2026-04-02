import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart } from 'lucide-react';
import bg from '@/assets/img/temple.webp';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('admin');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Always attempt login regardless of field values
    const success = login(email, password, role);
    if (success) {
      navigate(role === 'devotee' ? '/donate' : '/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left side with image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
  <img
    src={bg}
    alt="Temple"
    className="absolute inset-0 w-full h-full object-cover"
  />
</div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="mb-8">
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <span className="text-lg font-display font-bold text-foreground">OMG Temple</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Welcome back</h1>
            <p className="text-muted-foreground mt-1 text-sm">Sign in to continue to your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</Label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as UserRole)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
              >
                <option value="admin">Admin</option>
                <option value="manager">Temple Manager</option>
                <option value="devotee">Devotee</option>
              </select>
            </div> */}

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</Label>
              <Input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Password</Label>
                <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
              </div>
              <Input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                placeholder="Enter your password"
              />
            </div>

            <Button type="submit" className="w-full h-11 font-medium">Sign In</Button>
          </form>
          
        
        </div>
      </div>
    </div>
  );
};

export default LoginPage;