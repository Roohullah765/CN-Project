import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { MailLayout } from '@/components/layout/MailLayout';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { User, Loader2, Save, CheckCircle } from 'lucide-react';

const Profile = () => {
  const { profile, refreshProfile, user } = useAuth();
  const { toast } = useToast();
  const cardRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: profile?.name || '',
  });
  const [profileFile, setProfileFile] = useState<File | null>(null);

  // Update form when profile loads
  useEffect(() => {
    if (profile?.name) {
      setForm({ name: profile.name });
    }
  }, [profile]);

  // GSAP animation on mount
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'power3.out' }
      );
    }

    if (formRef.current) {
      const inputs = formRef.current.querySelectorAll('.form-field');
      gsap.fromTo(
        inputs,
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, delay: 0.3, ease: 'power2.out' }
      );
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let profileImageUrl = profile?.profile_image;

      if (profileFile && user) {
        const fileExt = profileFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, profileFile);

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath);
          profileImageUrl = publicUrl;
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name: form.name,
          profile_image: profileImageUrl,
        })
        .eq('id', user?.id);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Update Failed',
          description: error.message,
        });
        return;
      }

      await refreshProfile();

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });

      // Success animation
      if (cardRef.current) {
        gsap.to(cardRef.current, {
          scale: 1.02,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          ease: 'power2.inOut',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const statusConfig = {
    pending: { 
      color: 'bg-warning/10 text-warning border-warning/20',
      icon: null,
    },
    approved: { 
      color: 'bg-success/10 text-success border-success/20',
      icon: <CheckCircle className="h-3 w-3" />,
    },
    rejected: { 
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: null,
    },
    suspended: { 
      color: 'bg-destructive/10 text-destructive border-destructive/20',
      icon: null,
    },
  };

  const currentStatus = profile?.status || 'pending';

  return (
    <MailLayout title="Profile Settings">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <Card ref={cardRef} className="shadow-soft border-border/50 overflow-hidden">
            <CardHeader className="relative">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full"
              />
              <CardTitle className="flex items-center gap-3 relative z-10">
                <motion.div
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400 }}
                >
                  <User className="h-5 w-5 text-primary" />
                </motion.div>
                Your Profile
              </CardTitle>
              <CardDescription>
                Manage your account settings and profile information.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <motion.div 
                  className="flex justify-center form-field"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <AvatarUpload
                    value={profile?.profile_image || undefined}
                    onChange={(file) => setProfileFile(file)}
                  />
                </motion.div>

                <div className="space-y-2 form-field">
                  <Label htmlFor="name">Full Name</Label>
                  <motion.div whileFocus={{ scale: 1.01 }}>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Your name"
                      className="transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                    />
                  </motion.div>
                </div>

                <div className="space-y-2 form-field">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed.
                  </p>
                </div>

                <div className="space-y-2 form-field">
                  <Label>Account Status</Label>
                  <div>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <Badge
                        variant="outline"
                        className={`${statusConfig[currentStatus]?.color} flex items-center gap-1.5 w-fit`}
                      >
                        {statusConfig[currentStatus]?.icon}
                        {currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1)}
                      </Badge>
                    </motion.div>
                  </div>
                </div>

                <motion.div 
                  className="flex justify-end pt-4 form-field"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button 
                    type="submit" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Loader2 className="h-4 w-4 mr-2" />
                      </motion.div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MailLayout>
  );
};

export default Profile;
