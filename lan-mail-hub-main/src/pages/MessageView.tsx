import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { MailLayout } from '@/components/layout/MailLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Clock, Reply } from 'lucide-react';
import { format } from 'date-fns';
import { Message } from '@/types/database';

const MessageView = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'inbox';
  const navigate = useNavigate();
  const { inbox, sent, markAsSeen } = useMessages();

  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    const messages = type === 'sent' ? sent : inbox;
    const found = messages.find((m) => m.id === id);
    if (found) {
      setMessage(found);

      // Mark as seen if it's an inbox message
      if (type === 'inbox' && found.status !== 'seen') {
        markAsSeen(found.id);
      }
    }
  }, [id, type, inbox, sent, markAsSeen]);

  if (!message) {
    return (
      <MailLayout>
        <div className="max-w-3xl mx-auto">
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center text-muted-foreground">
              Message not found
            </CardContent>
          </Card>
        </div>
      </MailLayout>
    );
  }

  const person = type === 'inbox' ? message.sender : message.receiver;

  return (
    <MailLayout>
      <div className="max-w-3xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate(type === 'sent' ? '/sent' : '/inbox')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to {type === 'sent' ? 'Sent' : 'Inbox'}
        </Button>

        <Card className="shadow-soft border-border/50">
          <CardHeader className="border-b">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12 border-2 border-border">
                  <AvatarImage src={person?.profile_image || undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground">
                    {person?.name?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-sans font-bold">{message.subject}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium">
                      {type === 'inbox' ? 'From:' : 'To:'} {person?.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      &lt;{person?.email}&gt;
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {format(new Date(message.created_at), 'MMM d, yyyy h:mm a')}
                </div>
                <Badge
                  variant={message.status === 'seen' ? 'default' : 'secondary'}
                  className="mt-2"
                >
                  {message.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                {message.content}
              </p>
            </div>

            {type === 'inbox' && (
              <div className="mt-8 pt-6 border-t">
                <Button
                  onClick={() => navigate('/compose')}
                  className="gradient-primary"
                >
                  <Reply className="h-4 w-4 mr-2" />
                  Reply
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MailLayout>
  );
};

export default MessageView;
