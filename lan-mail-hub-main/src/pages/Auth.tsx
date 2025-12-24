import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { useToast } from '@/hooks/use-toast';
import { Mail, Loader2 } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name must be at least 2 characters'),
});

const Auth = () => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });
  const [profileFile, setProfileFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = loginSchema.safeParse(loginForm);
      if (!validation.success) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: validation.error.errors[0].message,
        });
        return;
      }

      const { error } = await signIn(loginForm.email, loginForm.password);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Welcome back!',
        description: 'Successfully logged in.',
      });
      navigate('/inbox');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const validation = signupSchema.safeParse(signupForm);
      if (!validation.success) {
        toast({
          variant: 'destructive',
          title: 'Validation Error',
          description: validation.error.errors[0].message,
        });
        return;
      }

      let profileImageUrl: string | undefined;

      // Upload profile image if provided
      if (profileFile) {
        const fileExt = profileFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        // Sign up first to get user ID, then upload
        const { error: signupError } = await signUp(
          signupForm.email,
          signupForm.password,
          signupForm.name
        );

        if (signupError) {
          toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: signupError.message,
          });
          return;
        }

        // Get the newly created user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && profileFile) {
          const filePath = `${user.id}/${fileName}`;
          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, profileFile);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);

            // Update profile with image
            await supabase
              .from('profiles')
              .update({ profile_image: publicUrl })
              .eq('id', user.id);
          }
        }

        toast({
          title: 'Account Created!',
          description: 'Your account is pending admin approval.',
        });
        navigate('/pending');
        return;
      }

      const { error } = await signUp(signupForm.email, signupForm.password, signupForm.name);

      if (error) {
        if (error.message.includes('already registered')) {
          toast({
            variant: 'destructive',
            title: 'Email Already Registered',
            description: 'This email is already in use. Please try logging in.',
          });
        } else {
          toast({
            variant: 'destructive',
            title: 'Sign Up Failed',
            description: error.message,
          });
        }
        return;
      }

      toast({
        title: 'Account Created!',
        description: 'Your account is pending admin approval.',
      });
      navigate('/pending');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex gradient-primary p-3 rounded-2xl mb-4">
            <Mail className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-sans font-bold text-foreground">Simple Mail</h1>
          <p className="text-muted-foreground mt-2">LAN-based messaging for your team</p>
        </div>

        <Card className="shadow-soft border-border/50">
          <Tabs defaultValue="login">
            <CardHeader className="pb-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
            </CardHeader>

            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@company.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="flex justify-center">
                    <AvatarUpload
                      value={previewUrl || undefined}
                      onChange={(file, url) => {
                        setProfileFile(file);
                        setPreviewUrl(url);
                      }}
                      size="md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@company.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full gradient-primary" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    New accounts require admin approval before you can access the app.
                  </p>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
