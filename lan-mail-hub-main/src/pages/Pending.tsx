import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const Pending = () => {
  const { profile, isApproved, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Poll for status changes
    const interval = setInterval(() => {
      refreshProfile();
    }, 5000);

    return () => clearInterval(interval);
  }, [refreshProfile]);

  useEffect(() => {
    if (isApproved) {
      navigate('/inbox');
    }
  }, [isApproved, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (profile?.status === 'rejected') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md shadow-soft animate-slide-up">
          <CardHeader className="text-center">
            <div className="inline-flex mx-auto bg-destructive/10 p-4 rounded-full mb-4">
              <Mail className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Account Rejected</CardTitle>
            <CardDescription>
              Unfortunately, your account request has been rejected by an administrator.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-soft animate-slide-up">
        <CardHeader className="text-center">
          <div className="inline-flex mx-auto bg-warning/10 p-4 rounded-full mb-4">
            <Clock className="h-8 w-8 text-warning animate-pulse" />
          </div>
          <CardTitle className="text-2xl">Awaiting Approval</CardTitle>
          <CardDescription>
            Your account has been created and is pending administrator approval.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-accent/50 rounded-xl p-4 text-center">
            <p className="text-sm text-muted-foreground">
              You'll be automatically redirected once your account is approved.
              This page refreshes every 5 seconds.
            </p>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleSignOut} variant="outline">
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pending;
