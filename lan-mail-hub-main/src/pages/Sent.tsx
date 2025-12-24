import { useMessages } from '@/hooks/useMessages';
import { MailLayout } from '@/components/layout/MailLayout';
import { MessageCard } from '@/components/mail/MessageCard';
import { Send as SendIcon, Loader2 } from 'lucide-react';

const Sent = () => {
  const { sent, isLoading, refetch } = useMessages();

  if (isLoading) {
    return (
      <MailLayout title="Sent">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="Sent" onRefresh={refetch}>
      {sent.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <SendIcon className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">No sent messages</p>
          <p className="text-sm">Messages you send will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {sent.map((message) => (
            <MessageCard key={message.id} message={message} type="sent" />
          ))}
        </div>
      )}
    </MailLayout>
  );
};

export default Sent;
