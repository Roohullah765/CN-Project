import { MailLayout } from '@/components/layout/MailLayout';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, RotateCcw, Trash } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const TrashPage = () => {
  const { trash, isLoading, refetch, restoreFromTrash, permanentlyDelete } = useMessages();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRestore = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    const { error } = await restoreFromTrash(messageId);
    if (!error) {
      toast({ title: 'Message Restored', description: 'Message has been restored.' });
    }
  };

  const handleDelete = async (e: React.MouseEvent, messageId: string) => {
    e.stopPropagation();
    const { error } = await permanentlyDelete(messageId);
    if (!error) {
      toast({ title: 'Message Deleted', description: 'Message has been permanently deleted.' });
    }
  };

  if (isLoading) {
    return (
      <MailLayout title="Trash">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="Trash" onRefresh={refetch}>
      {trash.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Trash2 className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">Trash is empty</p>
          <p className="text-sm">Deleted messages will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {trash.map((message) => {
            const contact = message.sender || message.receiver;
            return (
              <div
                key={message.id}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/message/${message.id}`)}
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={contact?.profile_image || undefined} />
                  <AvatarFallback>{contact?.name?.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">{contact?.name}</p>
                    <span className="text-xs text-muted-foreground">
                      {message.deleted_at && formatDistanceToNow(new Date(message.deleted_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{message.subject}</p>
                  <p className="text-sm text-muted-foreground truncate">{message.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleRestore(e, message.id)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(e, message.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </MailLayout>
  );
};

export default TrashPage;
