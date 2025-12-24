import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { MailLayout } from '@/components/layout/MailLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { PenSquare, Send, Loader2 } from 'lucide-react';

const Compose = () => {
  const { user } = useAuth();
  const { sendMessage } = useMessages();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    receiverId: '',
    subject: '',
    content: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('status', 'approved')
        .neq('id', user?.id);

      if (data) {
        setUsers(data as Profile[]);
      }
    };

    fetchUsers();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.receiverId || !form.subject.trim() || !form.content.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Fields',
        description: 'Please fill in all fields.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await sendMessage(form.receiverId, form.subject, form.content);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Failed to Send',
          description: error.message,
        });
        return;
      }

      toast({
        title: 'Message Sent',
        description: 'Your message has been delivered.',
      });

      navigate('/sent');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUser = users.find((u) => u.id === form.receiverId);

  return (
    <MailLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-soft border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PenSquare className="h-5 w-5 text-primary" />
              Compose Message
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Select
                  value={form.receiverId}
                  onValueChange={(value) => setForm({ ...form, receiverId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a recipient">
                      {selectedUser && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={selectedUser.profile_image || undefined} />
                            <AvatarFallback className="text-xs">
                              {selectedUser.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {selectedUser.name}
                        </div>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {users.length === 0 ? (
                      <div className="px-2 py-4 text-sm text-muted-foreground text-center">
                        No users available
                      </div>
                    ) : (
                      users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={u.profile_image || undefined} />
                              <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{u.name}</p>
                              <p className="text-xs text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Enter subject"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Message</Label>
                <Textarea
                  id="content"
                  placeholder="Write your message..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="gradient-primary" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MailLayout>
  );
};

export default Compose;
