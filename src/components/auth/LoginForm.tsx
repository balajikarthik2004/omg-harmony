import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useTier } from '@/contexts/TierContext';
import { getLandingRoute } from '@/lib/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  isCustomized?: boolean;
}

export const LoginForm: React.FC<LoginFormProps> = ({ isCustomized = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role] = useState<UserRole>('admin');
  const { login } = useAuth();
  const { tier } = useTier();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Always attempt login regardless of field values
    const success = login(email, password, role);
    if (success) {
      navigate(getLandingRoute(role, tier));
    }
  };

  return (
    <div className="w-full max-w-[380px]">
      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-[1.6rem] leading-tight font-display font-bold text-foreground tracking-tight">
          Welcome back
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          {isCustomized ? 'Sign in to continue' : 'Sign in to get started'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
            Email
          </Label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-focus-within:text-primary" />
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              autoComplete="email"
              className="pl-11 h-11 rounded-xl login-input-enhanced bg-background/60 border-border/70 hover:border-border focus:border-primary"
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.12em]">
              Password
            </Label>
            <button
              type="button"
              className="text-[11px] text-primary/80 hover:text-primary transition-colors duration-200 font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 transition-colors duration-300 group-focus-within:text-primary" />
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              className="pl-11 pr-11 h-11 rounded-xl login-input-enhanced bg-background/60 border-border/70 hover:border-border focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors duration-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full h-11 login-btn-premium login-btn-shimmer text-primary-foreground rounded-xl mt-1 group"
        >
          <span className="relative z-10 flex items-center gap-2">
            Sign In
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </Button>
      </form>

      {/* Divider */}
      <div className="login-divider mt-5">
        <span>secure login</span>
      </div>
    </div>
  );
};

export default LoginForm;
