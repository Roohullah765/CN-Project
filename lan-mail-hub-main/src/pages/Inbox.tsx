import { motion } from 'framer-motion';
import { useMessages } from '@/hooks/useMessages';
import { MailLayout } from '@/components/layout/MailLayout';
import { MessageCard } from '@/components/mail/MessageCard';
import { Inbox as InboxIcon, Loader2 } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

const Inbox = () => {
  const { inbox, isLoading, refetch } = useMessages();

  if (isLoading) {
    return (
      <MailLayout title="Inbox">
        <div className="flex justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </MailLayout>
    );
  }

  return (
    <MailLayout title="Inbox" onRefresh={refetch}>
      {inbox.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 text-muted-foreground"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <InboxIcon className="h-16 w-16 mb-4 opacity-20" />
          </motion.div>
          <p className="text-lg">No messages yet</p>
          <p className="text-sm">Messages you receive will appear here</p>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {inbox.map((message, index) => (
            <motion.div key={message.id} variants={itemVariants}>
              <MessageCard message={message} type="inbox" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </MailLayout>
  );
};

export default Inbox;
