import { useAdmin } from '@/hooks/useAdmin';
import { MailLayout } from '@/components/layout/MailLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check, X, Ban, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Profile } from '@/types/database';

const AdminUsers = () => {
  const { 
    allUsers, 
    isLoading, 
    approveUser, 
    rejectUser, 
    suspendUser,
    deleteUser,
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

  const handleDelete = async (userId: string, name: string) => {
    const { error } = await deleteUser(userId);
    if (!error) {
      toast({ title: 'User Deleted', description: `${name} has been removed from the system.` });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
      pending: { variant: 'secondary', className: 'bg-warning/20 text-warning border-warning/30' },
      approved: { variant: 'secondary', className: 'bg-success/20 text-success border-success/30' },
      rejected: { variant: 'destructive', className: '' },
      suspended: { variant: 'outline', className: 'text-muted-foreground' },
    };
    return variants[status] || variants.pending;
  };

  if (isLoading) {
    return (
      <MailLayout title="User Management">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="User Management" onRefresh={refetch}>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">User</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Joined</th>
                  <th className="text-right p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map((user) => {
                  const badge = getStatusBadge(user.status);
                  return (
                    <tr key={user.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profile_image || undefined} />
                            <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={badge.variant} className={badge.className}>
                          {user.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          {user.status !== 'approved' && (
                            <Button size="sm" variant="ghost" onClick={() => handleApprove(user.id, user.name)}>
                              <Check className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status !== 'rejected' && (
                            <Button size="sm" variant="ghost" onClick={() => handleReject(user.id, user.name)}>
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                          {user.status === 'approved' && (
                            <Button size="sm" variant="ghost" onClick={() => handleSuspend(user.id, user.name)}>
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDelete(user.id, user.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </MailLayout>
  );
};

export default AdminUsers;
