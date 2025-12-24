import { ReactNode, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  Inbox,
  Send,
  PenSquare,
  Settings,
  LogOut,
  Star,
  FileText,
  Trash2,
  LayoutDashboard,
  Users,
  Mail,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MailLayoutProps {
  children: ReactNode;
  onRefresh?: () => void;
  title?: string;
}

const sidebarVariants = {
  hidden: { x: -100, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut' as const,
      staggerChildren: 0.05,
    },
  },
};

const navItemVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut' as const },
  },
};

export const MailLayout = ({ children, onRefresh, title }: MailLayoutProps) => {
  const { profile, isAdmin, signOut } = useAuth();
  const { unreadCount } = useMessages();
  const location = useLocation();
  const navigate = useNavigate();
  const refreshBtnRef = useRef<HTMLButtonElement>(null);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleRefresh = () => {
    if (refreshBtnRef.current) {
      gsap.to(refreshBtnRef.current, {
        rotation: 360,
        duration: 0.6,
        ease: 'power2.inOut',
        onComplete: () => {
          gsap.set(refreshBtnRef.current, { rotation: 0 });
        },
      });
    }
    onRefresh?.();
  };

  const mainNavItems = [
    { href: '/inbox', icon: Inbox, label: 'Inbox', badge: unreadCount },
    { href: '/starred', icon: Star, label: 'Starred' },
    { href: '/sent', icon: Send, label: 'Sent' },
    { href: '/drafts', icon: FileText, label: 'Drafts' },
    { href: '/trash', icon: Trash2, label: 'Trash' },
  ];

  const adminNavItems = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/users', icon: Users, label: 'Users' },
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <motion.aside 
        variants={sidebarVariants}
        initial="hidden"
        animate="visible"
        className="hidden md:flex w-64 flex-col border-r bg-card"
      >
        {/* Logo */}
        <motion.div 
          variants={navItemVariants}
          className="p-4 border-b"
        >
          <Link to="/inbox" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary p-2 rounded-lg"
            >
              <Mail className="h-5 w-5 text-primary-foreground" />
            </motion.div>
            <span className="font-sans text-lg font-bold text-foreground group-hover:text-primary transition-colors">
              Mail System
            </span>
          </Link>
        </motion.div>

        {/* Compose Button */}
        <motion.div variants={navItemVariants} className="p-4">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={() => navigate('/compose')}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose
            </Button>
          </motion.div>
        </motion.div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {mainNavItems.map((item, index) => (
            <motion.div
              key={item.href}
              variants={navItemVariants}
              whileHover={{ x: 4 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link to={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 h-10 font-normal transition-all duration-200',
                    location.pathname === item.href && 'bg-primary/10 text-primary font-medium'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                  {item.badge ? (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full"
                    >
                      {item.badge}
                    </motion.span>
                  ) : null}
                </Button>
              </Link>
            </motion.div>
          ))}

          {/* Admin Section */}
          {isAdmin && (
            <>
              <motion.div 
                variants={navItemVariants}
                className="pt-4 pb-2"
              >
                <span className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Admin
                </span>
              </motion.div>
              {adminNavItems.map((item) => (
                <motion.div
                  key={item.href}
                  variants={navItemVariants}
                  whileHover={{ x: 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                >
                  <Link to={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        'w-full justify-start gap-3 h-10 font-normal transition-all duration-200',
                        location.pathname === item.href && 'bg-primary/10 text-primary font-medium'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </>
          )}
        </nav>

        {/* User Profile at Bottom */}
        <motion.div 
          variants={navItemVariants}
          className="p-4 border-t"
        >
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={profile?.profile_image || undefined} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{profile?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
            <div className="flex gap-1">
              <motion.div whileHover={{ scale: 1.1, rotate: 15 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate('/profile')}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {title && (
          <motion.header 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-6"
          >
            <h1 className="text-lg font-semibold flex items-center gap-2">
              {title}
            </h1>
            <div className="flex items-center gap-2">
              {onRefresh && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button ref={refreshBtnRef} variant="ghost" size="icon" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
              <ThemeToggle />
            </div>
          </motion.header>
        )}

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t z-50">
        <div className="flex justify-around py-2">
          {mainNavItems.slice(0, 4).map((item) => (
            <Link key={item.href} to={item.href}>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'relative h-12 w-12',
                    location.pathname === item.href && 'text-primary'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.badge ? (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs font-medium h-5 w-5 flex items-center justify-center rounded-full"
                    >
                      {item.badge > 9 ? '9+' : item.badge}
                    </motion.span>
                  ) : null}
                </Button>
              </motion.div>
            </Link>
          ))}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-12 w-12"
              onClick={() => navigate('/compose')}
            >
              <PenSquare className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      </nav>
    </div>
  );
};
