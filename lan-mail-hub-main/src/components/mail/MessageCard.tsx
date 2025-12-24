import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/database';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { useMessages } from '@/hooks/useMessages';
import { Star, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageCardProps {
  message: Message;
  type: 'inbox' | 'sent' | 'draft';
}

export const MessageCard = ({ message, type }: MessageCardProps) => {
  const navigate = useNavigate();
  const { toggleStarred, moveToTrash } = useMessages();
  const { toast } = useToast();
  
  const person = type === 'inbox' ? message.sender : message.receiver;
  const isUnread = type === 'inbox' && message.status !== 'seen';

  const handleClick = () => {
    if (type === 'draft') {
      navigate(`/compose?draft=${message.id}`);
    } else {
      navigate(`/message/${message.id}`);
    }
  };

  const handleStar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleStarred(message.id, message.is_starred);
  };

  const handleTrash = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const { error } = await moveToTrash(message.id);
    if (!error) {
      toast({ title: 'Moved to Trash', description: 'Message has been moved to trash.' });
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{ 
        scale: 1.01, 
        x: 4,
        boxShadow: '0 8px 30px -10px hsl(var(--primary) / 0.15)',
      }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-colors duration-200',
        'hover:border-primary/20 hover:bg-accent/50',
        isUnread
          ? 'bg-accent/30 border-primary/20'
          : 'bg-card border-border'
      )}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400 }}
      >
        <Avatar className="h-12 w-12 border-2 border-border">
          <AvatarImage src={person?.profile_image || undefined} />
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            {person?.name?.charAt(0).toUpperCase() || '?'}
          </AvatarFallback>
        </Avatar>
      </motion.div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className={cn('font-medium truncate', isUnread && 'font-semibold text-foreground')}>
            {type === 'draft' ? (person?.name || 'No recipient') : (person?.name || 'Unknown User')}
          </p>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>

        <p className={cn('text-sm truncate mb-1', isUnread ? 'font-medium text-foreground' : 'text-foreground')}>
          {message.subject || '(No subject)'}
        </p>

        <p className="text-sm text-muted-foreground truncate">
          {message.content || '(No content)'}
        </p>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1">
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleStar}
            >
              <motion.div
                animate={message.is_starred ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Star className={cn('h-4 w-4', message.is_starred && 'fill-warning text-warning')} />
              </motion.div>
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={handleTrash}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </motion.div>
        </div>
        {isUnread && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="h-2.5 w-2.5 rounded-full bg-primary"
          />
        )}
        {type === 'sent' && (
          <Badge variant={message.status === 'seen' ? 'default' : 'secondary'} className="text-xs">
            {message.status}
          </Badge>
        )}
        {type === 'draft' && (
          <Badge variant="outline" className="text-xs">
            Draft
          </Badge>
        )}
      </div>
    </motion.div>
  );
};
