'use client';

import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';

import {
  FileText,
  FolderKanban,
  Folders,
  Image as ImageIcon,
  ArrowRight
} from 'lucide-react';

import Link from 'next/link';

const sections = [
  {
    title: 'Blogs',
    description: 'Create, edit and manage website blog content.',
    icon: FileText,
    href: '/dashboard/blog',
    action: 'Manage Blogs'
  },
  {
    title: 'Projects',
    description: 'Manage CCS projects, content, images and project details.',
    icon: FolderKanban,
    href: '/dashboard/projects',
    action: 'Manage Projects'
  },
  {
    title: 'Project Groups',
    description: 'Organize projects into groups and manage their display.',
    icon: Folders,
    href: '/dashboard/project-groups',
    action: 'Manage Groups'
  },
  {
    title: 'Gallery',
    description: 'Manage website gallery images and media.',
    icon: ImageIcon,
    href: '/dashboard/gallary',
    action: 'Manage Gallery'
  }
];

export default function OverViewPage() {
  return (
    <PageContainer>
      <div className='flex flex-1 flex-col space-y-8'>

        {/* Header */}
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>
            Dashboard
          </h2>

          <p className='text-muted-foreground mt-1'>
            CCS INFRATECH website administration and content management.
          </p>
        </div>

        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Welcome to CCS INFRATECH Admin</CardTitle>

            <CardDescription>
              Manage your website content and digital presence from one place.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className='flex flex-wrap gap-3'>
              <Button asChild>
                <Link href='/dashboard/projects'>
                  Manage Projects
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>

              <Button variant='outline' asChild>
                <Link href='/dashboard/blog'>
                  Manage Blogs
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Management Sections */}
        <div>
          <h3 className='mb-4 text-lg font-semibold'>
            Content Management
          </h3>

          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-4'>
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <Card
                  key={section.title}
                  className='transition-shadow hover:shadow-md'
                >
                  <CardHeader>
                    <Icon className='text-muted-foreground mb-2 h-6 w-6' />

                    <CardTitle className='text-base'>
                      {section.title}
                    </CardTitle>

                    <CardDescription>
                      {section.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <Button
                      variant='outline'
                      className='w-full'
                      asChild
                    >
                      <Link href={section.href}>
                        {section.action}

                        <ArrowRight className='ml-2 h-4 w-4' />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Media Management */}
        <Card>
          <CardHeader>
            <CardTitle>Media</CardTitle>

            <CardDescription>
              Manage gallery and press coverage content.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className='flex flex-wrap gap-3'>
              <Button variant='outline' asChild>
                <Link href='/dashboard/gallary'>
                  Gallery
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>

              <Button variant='outline' asChild>
                <Link href='/dashboard/press-coverage'>
                  Press and Coverage
                  <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

      </div>
    </PageContainer>
  );
}
