import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useAuth } from '@/context/authContext';
import { UserCircle2 } from 'lucide-react';
import Image from 'next/image';

interface UserAvatarProfileProps {
  className?: string;
  showInfo?: boolean;
  showStatus?: boolean;
}

export function UserAvatarProfile({
  className,
  showInfo = false,
  showStatus = true
}: UserAvatarProfileProps) {
  const { user, status } = useAuth();
  const isLoading = status === 'loading';
  const [isHovered, setIsHovered] = useState(false);

  // Theme color
  const themeColor = 'bg-[#e1d18a]';

  const getRoleColor = (role?: string) => {
    if (!role) return `${themeColor}`;

    switch (role.toLowerCase()) {
      case 'admin':
        return 'bg-gradient-to-r from-[#e1d18a] to-amber-500';
      case 'manager':
        return 'bg-gradient-to-r from-[#e1d18a] to-amber-400';
      case 'user':
        return themeColor;
      default:
        return themeColor;
    }
  };

  if (isLoading) {
    return (
      <div className='flex items-center gap-3'>
        <div className='relative'>
          <Skeleton className={`h-10 w-10 rounded-full ${className}`} />
          {showStatus && (
            <Skeleton className='absolute -right-1 -bottom-1 h-3 w-3 rounded-full' />
          )}
        </div>
        {showInfo && (
          <div className='grid flex-1 gap-1.5'>
            <Skeleton className='h-4 w-28' />
            <Skeleton className='h-3 w-20' />
          </div>
        )}
      </div>
    );
  }

  return (
    <motion.div
      className='flex items-center gap-3'
      initial={{ opacity: 0.8 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className='relative'>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          className={`flex h-10 w-10 items-center justify-center rounded-full ${getRoleColor(user?.role)} ring-offset-background shadow-sm ring-2 ring-[#e1d18a]/30 ring-offset-2 ${className} overflow-hidden`}
        >
          <Image
            src={'/assets/userimg.png'}
            height={60}
            width={60}
            alt='userimg'
            className='h-full w-full object-cover'
          />
        </motion.div>

        {showStatus && (
          <span className='absolute -right-1 -bottom-1 flex h-3.5 w-3.5'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75'></span>
            <span className='relative inline-flex h-3.5 w-3.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-gray-900'></span>
          </span>
        )}
      </div>

      {showInfo && user && (
        <motion.div
          className='grid flex-1 text-left leading-tight'
          animate={isHovered ? { y: -2 } : { y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <span className='dark:text-foreground/90 truncate text-sm font-semibold text-gray-800'>
            {user.username}
          </span>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className={`border-0 px-2 py-0 text-[10px] font-medium capitalize ${getRoleColor(
                user.role
              )} text-gray-800 shadow-sm`}
            >
              {user.role}
            </Badge>
            <span className='dark:text-muted-foreground text-[10px] text-gray-500'>
              Online
            </span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
