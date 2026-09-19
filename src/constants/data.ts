import { NavItem } from '@/types';

export type Product = {
  photo_url: string;
  name: string;
  description: string;
  created_at: string;
  price: number;
  id: number;
  category: string;
  updated_at: string;
};

export const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: 'dashboard',
    shortcut: ['h', 'h'],
    isActive: true,
    items: []
  },
  {
    title: 'Blogs',
    url: '/dashboard/blog',
    icon: 'userPen',
    shortcut: ['p', 'p'],
    isActive: false,
    items: []
  },
  {
    title: 'Projects',
    url: '/dashboard/projects',
    icon: 'dashboard',
    shortcut: ['d', 'd'],
    isActive: false,
    items: []
  },
  {
    title: 'Project Groups',
    url: '/dashboard/project-groups',
    icon: 'folders',
    shortcut: ['g', 'g'],
    isActive: false,
    items: []
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: 'settings',
    shortcut: ['s', 's'],
    isActive: false,
    items: []
  },
  {
    title: 'Leadership',
    url: '/dashboard/leadership',
    icon: 'userPen',
    shortcut: ['t', 't'],
    isActive: false,
    items: []
  },
  {
    title: 'Media',
    url: '#',
    icon: 'billing',
    isActive: true,
    items: [
      {
        title: 'Events & Campaigns',
        url: '/dashboard/gallary',
        icon: 'userPen',
        shortcut: ['m', 'm']
      },
      {
        title: 'Walkthrough',
        url: '/dashboard/walkthrough',
        icon: 'media',
        shortcut: ['m', 'w']
      },
      {
        title: 'Press and Coverage',
        url: '/dashboard/press-coverage',
        icon: 'userPen',
        shortcut: ['m', 'm']
      }
    ]
  }
];

export interface SaleUser {
  id: number;
  name: string;
  email: string;
  amount: string;
  image: string;
  initials: string;
}

export const recentSalesData: SaleUser[] = [
  {
    id: 1,
    name: 'Olivia Martin',
    email: 'olivia.martin@email.com',
    amount: '+$1,999.00',
    image: 'https://api.slingacademy.com/public/sample-users/1.png',
    initials: 'OM'
  },
  {
    id: 2,
    name: 'Jackson Lee',
    email: 'jackson.lee@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/2.png',
    initials: 'JL'
  },
  {
    id: 3,
    name: 'Isabella Nguyen',
    email: 'isabella.nguyen@email.com',
    amount: '+$299.00',
    image: 'https://api.slingacademy.com/public/sample-users/3.png',
    initials: 'IN'
  },
  {
    id: 4,
    name: 'William Kim',
    email: 'will@email.com',
    amount: '+$99.00',
    image: 'https://api.slingacademy.com/public/sample-users/4.png',
    initials: 'WK'
  },
  {
    id: 5,
    name: 'Sofia Davis',
    email: 'sofia.davis@email.com',
    amount: '+$39.00',
    image: 'https://api.slingacademy.com/public/sample-users/5.png',
    initials: 'SD'
  }
];
