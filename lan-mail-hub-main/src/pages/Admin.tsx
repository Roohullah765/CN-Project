import { useAdmin } from '@/hooks/useAdmin';
import { MailLayout } from '@/components/layout/MailLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Shield, Check, X, Loader2, Users, Clock, UserX, Ban } from 'lucide-react';
import { format } from 'date-fns';
import { Profile } from '@/types/database';

const Admin = () => {
  const { 
    allUsers, 
    pendingUsers, 
    approvedUsers, 
    rejectedUsers, 
    suspendedUsers, 
    isLoading, 
    approveUser, 
    rejectUser, 
    suspendUser,
    refetch 
  } = useAdmin();
  const { toast } = useToast();

  const handleApprove = async (userId: string, name: string) => {
    const { error } = await approveUser(userId);
    if (!error) {
      toast({ title: 'User Approved', description: `${name} can now access the system.` });
    }
  };

  const handleReject = async (userId: string, name: string) => {
    const { error } = await rejectUser(userId);
    if (!error) {
      toast({ title: 'User Rejected', description: `${name}'s access has been denied.` });
    }
  };

  const handleSuspend = async (userId: string, name: string) => {
    const { error } = await suspendUser(userId);
    if (!error) {
      toast({ title: 'User Suspended', description: `${name}'s account has been suspended.` });
    }
  };

  const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => (
    <Card className={`border-l-4 ${color}`}>
      <CardContent className="p-4 flex items-center gap-4">
        <div className="p-2 rounded-lg bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );

  const UserCard = ({ user, showActions }: { user: Profile; showActions?: boolean }) => (
    <div className="flex items-center justify-between p-4 bg-card rounded-xl border hover:shadow-soft transition-shadow">
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarImage src={user.profile_image || undefined} />
          <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{format(new Date(user.created_at), 'MMM d, yyyy')}</p>
        </div>
      </div>
      {showActions && (
        <div className="flex gap-2">
          {user.status !== 'approved' && (
            <Button size="sm" className="bg-success hover:bg-success/90" onClick={() => handleApprove(user.id, user.name)}>
              <Check className="h-4 w-4 mr-1" /> Approve
            </Button>
          )}
          {user.status !== 'rejected' && (
            <Button size="sm" variant="destructive" onClick={() => handleReject(user.id, user.name)}>
              <X className="h-4 w-4 mr-1" /> Reject
            </Button>
          )}
          {user.status !== 'suspended' && user.status === 'approved' && (
            <Button size="sm" variant="outline" onClick={() => handleSuspend(user.id, user.name)}>
              <Ban className="h-4 w-4 mr-1" /> Suspend
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderUserList = (users: Profile[], showActions: boolean = false, emptyMessage: string = 'No users found') => (
    users.length === 0 ? (
      <Card><CardContent className="py-12 text-center text-muted-foreground">{emptyMessage}</CardContent></Card>
    ) : (
      <div className="space-y-3">{users.map((user) => <UserCard key={user.id} user={user} showActions={showActions} />)}</div>
    )
  );

  if (isLoading) {
    return (
      <MailLayout title="Admin Dashboard">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="Admin Dashboard" onRefresh={refetch}>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard icon={Users} label="Total Users" value={allUsers.length} color="border-l-primary" />
          <StatCard icon={Clock} label="Pending" value={pendingUsers.length} color="border-l-warning" />
          <StatCard icon={Check} label="Approved" value={approvedUsers.length} color="border-l-success" />
          <StatCard icon={UserX} label="Rejected" value={rejectedUsers.length} color="border-l-destructive" />
          <StatCard icon={Ban} label="Suspended" value={suspendedUsers.length} color="border-l-muted-foreground" />
        </div>

        {/* User Tabs */}
        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">All Users</h2>
              {renderUserList(allUsers, true)}
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Pending Users</h2>
              {renderUserList(pendingUsers, true, 'No pending users found')}
            </Card>
          </TabsContent>

          <TabsContent value="approved" className="mt-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Approved Users</h2>
              {renderUserList(approvedUsers, true, 'No approved users found')}
            </Card>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Rejected Users</h2>
              {renderUserList(rejectedUsers, true, 'No rejected users found')}
            </Card>
          </TabsContent>

          <TabsContent value="suspended" className="mt-6">
            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Suspended Users</h2>
              {renderUserList(suspendedUsers, true, 'No suspended users found')}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MailLayout>
  );
};

export default Admin;
