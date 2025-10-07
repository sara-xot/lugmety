import { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { Separator } from './ui/separator';

interface AuthFlowProps {
  mode: 'signin' | 'signup' | 'forgot';
  onModeChange: (mode: 'signin' | 'signup' | 'forgot') => void;
  onClose: () => void;
  onSuccess: (user: { name: string; email: string }) => void;
}

export function AuthFlow({ mode, onModeChange, onClose, onSuccess }: AuthFlowProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      if (mode === 'signin') {
        if (formData.email === 'demo@lugmety.com' && formData.password === 'demo123') {
          onSuccess({ name: 'Demo User', email: formData.email });
        } else {
          setError('Invalid email or password');
        }
      } else if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
        } else if (!acceptTerms) {
          setError('Please accept the terms and conditions');
        } else {
          onSuccess({ name: formData.name, email: formData.email });
        }
      } else if (mode === 'forgot') {
        // Simulate password reset
        alert('Password reset link sent to your email!');
        onModeChange('signin');
      }
      setIsLoading(false);
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    // Simulate social login
    setTimeout(() => {
      onSuccess({ name: 'Social User', email: 'user@example.com' });
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
      <div className="min-h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-semibold">
            {mode === 'signin' && 'Welcome Back'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'forgot' && 'Reset Password'}
          </h1>
        </div>

        <div className="flex-1 p-6 space-y-6">
          {mode !== 'forgot' && (
            <>
              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('google')}
                  disabled={isLoading}
                >
                  {mode === 'signin' ? 'Sign in with Google' : 'Sign up with Google'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={isLoading}
                >
                  {mode === 'signin' ? 'Sign in with Apple' : 'Sign up with Apple'}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Separator className="flex-1" />
                <span className="text-sm text-muted-foreground">or</span>
                <Separator className="flex-1" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <Input
                type="text"
                placeholder="Full Name *"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                disabled={isLoading}
              />
            )}

            <Input
              type="email"
              placeholder="Email Address *"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
              disabled={isLoading}
            />

            {mode === 'signup' && (
              <Input
                type="tel"
                placeholder="Phone Number *"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
                disabled={isLoading}
              />
            )}

            {mode !== 'forgot' && (
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password *"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            )}

            {mode === 'signup' && (
              <Input
                type="password"
                placeholder="Confirm Password *"
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                disabled={isLoading}
              />
            )}

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                {error}
              </div>
            )}

            {mode === 'signin' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => onModeChange('forgot')}
                  className="text-sm text-primary hover:underline"
                  disabled={isLoading}
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="acceptTerms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  disabled={isLoading}
                />
                <label htmlFor="acceptTerms" className="text-sm leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary hover:underline">
                    Terms & Conditions
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </label>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Please wait...' : (
                mode === 'signin' ? 'Sign In' :
                mode === 'signup' ? 'Create Account' :
                'Send Reset Link'
              )}
            </Button>
          </form>

          {/* Switch Mode */}
          <div className="text-center">
            {mode === 'signin' ? (
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <button
                  onClick={() => onModeChange('signup')}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign Up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <button
                  onClick={() => onModeChange('signin')}
                  className="text-primary hover:underline font-medium"
                  disabled={isLoading}
                >
                  Sign In
                </button>
              </p>
            ) : (
              <button
                onClick={() => onModeChange('signin')}
                className="text-sm text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                Back to Sign In
              </button>
            )}
          </div>

          {/* Demo credentials hint */}
          {mode === 'signin' && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-sm text-blue-800 dark:text-blue-200 font-medium mb-1">
                Demo Credentials:
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Email: demo@lugmety.com<br />
                Password: demo123
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}