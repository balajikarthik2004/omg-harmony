import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Lock, Mail, ArrowRight } from 'lucide-react';
import bg from '@/assets/img/temple.webp';
import logo from '@/assets/img/logo.svg';

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
    <div className="min-h-screen flex bg-background relative overflow-hidden">
      {/* Decorative background orbs for right panel */}
      <div
        className="login-floating-orb animate-float hidden lg:block"
        style={{ width: 300, height: 300, background: 'hsl(1, 76%, 52%)', top: '-5%', right: '5%' }}
      />
      <div
        className="login-floating-orb hidden lg:block"
        style={{
          width: 200,
          height: 200,
          background: 'hsl(233, 53%, 35%)',
          bottom: '10%',
          right: '20%',
          animationDelay: '1.5s',
          animation: 'float 4s ease-in-out infinite',
        }}
      />

      {/* Left side with image + overlay branding */}
      <div className="hidden lg:flex lg:w-[55%] relative">
        <img
          src={bg}
          alt="Temple"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 login-image-overlay" />

        {/* Branding content on image */}
        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          {/* Top: Logo */}
          <div className="animate-fade-in">
            <img src={logo} alt="OMG Temple" className="h-14" />
          </div>

          {/* Bottom: Welcome copy */}
          {/* <div className="animate-fade-in max-w-md space-y-4" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-3xl font-display font-bold text-white/95 leading-tight">
              Managing Sacred Spaces,<br />
              <span className="text-white/70">Effortlessly.</span>
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Streamline temple operations with our comprehensive management platform — 
              from devotee records to financial tracking, all in one place.
            </p>
            // Feature badges 
            <div className="flex gap-3 pt-2">
              {['Operations', 'Finance', 'Reports'].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-medium text-white/70 bg-white/10 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-white/10 transition-colors duration-300 hover:bg-white/15 hover:text-white/90"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div> */}
        </div>
      </div>

      {/* Right login form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative">
        <div className="w-full max-w-[400px] animate-slide-in-right">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">OMG Temple</span>
          </div>

          {/* Login card */}
          <div className="login-glass-card">
            {/* Header */}
            <div className="mb-7">
              <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
                Welcome back
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
               Sign in to get started
              </p>
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

              {/* Email field */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-focus-within:text-primary" />
                  <Input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="pl-10 h-11 login-input-enhanced bg-background/60 border-border/80 hover:border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Password
                  </Label>
                  <button
                    type="button"
                    className="text-xs text-primary/80 hover:text-primary transition-colors duration-200 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-focus-within:text-primary" />
                  <Input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pl-10 h-11 login-input-enhanced bg-background/60 border-border/80 hover:border-border focus:border-primary"
                  />
                </div>
              </div>

              {/* Submit button */}
              <Button
                type="submit"
                className="w-full h-11 login-btn-premium login-btn-shimmer text-primary-foreground rounded-lg mt-1 group"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Button>
            </form>

            {/* Divider */}
            <div className="login-divider mt-6 mb-4">
              <span>secure login</span>
            </div>

            {/* Footer note */}
            {/* <p className="text-center text-xs text-muted-foreground/70">
              Protected by enterprise-grade encryption
            </p> */}
          </div>

          {/* Bottom branding for desktop */}
          <div className="hidden lg:flex items-center justify-center mt-6 gap-1.5">
            <span className="text-xs text-muted-foreground/50">Powered by</span>
            <span className="text-xs font-display font-semibold text-muted-foreground/70">
              OMG Temple Governance System
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;