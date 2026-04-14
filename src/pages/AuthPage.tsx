import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) { navigate('/'); }

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast.error(error.message); }
    else { toast.success('Password reset link sent! Check your email.'); }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      const { error } = await signUp(email, password, fullName);
      if (error) { toast.error(error.message); }
      else { toast.success('Account created! Check your email to confirm.'); }
    } else {
      const { error } = await signIn(email, password);
      if (error) { toast.error(error.message); }
      else { navigate('/'); }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto flex max-w-md items-center justify-center px-4 py-16">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {isForgot ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <CardDescription>
              {isForgot ? 'Enter your email to receive a reset link' : isSignUp ? 'Sign up to start shopping' : 'Sign in to your account'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForgot ? (
              <form onSubmit={handleForgot} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" required />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  <button type="button" onClick={() => setIsForgot(false)} className="text-primary hover:underline">Back to Sign In</button>
                </p>
              </form>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="John Doe" className="mt-1" required />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1" required />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="mt-1" required minLength={6} />
                  </div>
                  {!isSignUp && (
                    <div className="text-right">
                      <button type="button" onClick={() => setIsForgot(true)} className="text-sm text-primary hover:underline">Forgot password?</button>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
                  </Button>
                </form>
                <p className="mt-4 text-center text-sm text-muted-foreground">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:underline">
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
