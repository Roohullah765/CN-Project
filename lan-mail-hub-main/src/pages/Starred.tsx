import { MailLayout } from '@/components/layout/MailLayout';
import { MessageCard } from '@/components/mail/MessageCard';
import { useMessages } from '@/hooks/useMessages';
import { Loader2, Star } from 'lucide-react';

const Starred = () => {
  const { starred, isLoading, refetch } = useMessages();

  if (isLoading) {
    return (
      <MailLayout title="Starred">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="Starred" onRefresh={refetch}>
      {starred.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Star className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">No starred messages</p>
          <p className="text-sm">Star messages to find them easily later</p>
        </div>
      ) : (
        <div className="space-y-2">
          {starred.map((message) => (
            <MessageCard key={message.id} message={message} type="inbox" />
          ))}
        </div>
      )}
    </MailLayout>
  );
};

export default Starred;
