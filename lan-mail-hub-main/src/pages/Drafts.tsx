import { MailLayout } from '@/components/layout/MailLayout';
import { MessageCard } from '@/components/mail/MessageCard';
import { useMessages } from '@/hooks/useMessages';
import { Loader2, FileText } from 'lucide-react';

const Drafts = () => {
  const { drafts, isLoading, refetch } = useMessages();

  if (isLoading) {
    return (
      <MailLayout title="Drafts">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="Drafts" onRefresh={refetch}>
      {drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <FileText className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg">No drafts</p>
          <p className="text-sm">Messages you save as drafts will appear here</p>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map((message) => (
            <MessageCard key={message.id} message={message} type="draft" />
          ))}
        </div>
      )}
    </MailLayout>
  );
};

export default Drafts;
