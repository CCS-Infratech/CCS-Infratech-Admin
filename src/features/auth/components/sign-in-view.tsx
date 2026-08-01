'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Building2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '@/http/auth';
import { toast } from 'sonner';

export default function BuilderAdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await authService.login(formData);
      if (response) {
        toast.success('Logged In Successfully🎉');
        router.push('/dashboard');
      }
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 dark:bg-zinc-950'>
      {/* Left panel with background image */}
      <div className='relative hidden h-full flex-col p-10 text-white lg:flex dark:text-white'>
        <div className='absolute inset-0 overflow-hidden rounded-r-[140px]'>
          <Image
            src='/assets/builder.jpg'
            alt='Modern building architecture'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 dark:from-black/80 dark:to-black/60' />
        </div>

        <div className='relative z-20 flex items-center text-lg font-medium'>
          <Building2 className='mr-2' />
          Css Infratech
        </div>

        <div className='relative z-20 mt-auto'>
          <div className='space-y-4'>
            <h3 className='text-xl font-semibold tracking-tight'>
              Welcome Back
            </h3>
            <blockquote className='space-y-2'>
              <p className='text-lg leading-relaxed'>
                &ldquo;The admin dashboard gives you complete control over your
                site's content, design, and functionality.&rdquo;
              </p>
              <footer className='text-sm opacity-80'>Admin Panel v2.0</footer>
            </blockquote>
          </div>
        </div>
      </div>

      {/* Right side login form */}
      <div className='flex h-full items-center justify-center bg-white p-8 dark:bg-zinc-950'>
        <div className='flex w-full max-w-md flex-col items-center justify-center space-y-8'>
          <div className='flex w-full flex-col space-y-2 text-center'>
            <h1 className='text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100'>
              Css Infratech
            </h1>
            <p className='text-sm text-zinc-600 dark:text-zinc-400'>
              Enter your credentials to access the builder dashboard
            </p>
          </div>

          <div className='w-full'>
            <form onSubmit={handleSubmit} className='space-y-5'>
              {/* Error Message */}
              {error && (
                <div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-400'>
                  {error}
                </div>
              )}

              <div className='space-y-2'>
                <Label
                  htmlFor='identifier'
                  className='text-sm font-medium text-zinc-900 dark:text-zinc-100'
                >
                  Email or Username
                </Label>
                <Input
                  id='identifier'
                  type='text'
                  placeholder='admin@example.com or admin'
                  required
                  value={formData.identifier}
                  onChange={handleChange}
                  disabled={loading}
                  className='h-11 rounded-md border border-gray-300 bg-white text-zinc-900 placeholder:text-zinc-500 focus:border-black focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600'
                />
              </div>

              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <Label
                    htmlFor='password'
                    className='text-sm font-medium text-zinc-900 dark:text-zinc-100'
                  >
                    Password
                  </Label>
                  <Link
                    href='/admin/forgot-password'
                    className='text-sm text-zinc-600 transition-colors hover:text-black dark:text-zinc-400 dark:hover:text-zinc-200'
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className='relative'>
                  <Input
                    id='password'
                    type={showPassword ? 'text' : 'password'}
                    placeholder='••••••••'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    disabled={loading}
                    className='h-11 rounded-md border border-gray-300 bg-white pr-10 text-zinc-900 placeholder:text-zinc-500 focus:border-black focus:ring-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-zinc-600 dark:focus:ring-zinc-600'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none dark:text-zinc-400 dark:hover:text-zinc-200'
                  >
                    {showPassword ? (
                      <EyeOff className='h-5 w-5' />
                    ) : (
                      <Eye className='h-5 w-5' />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type='submit'
                disabled={loading}
                className='h-11 w-full bg-black font-medium text-white transition-colors hover:bg-black/90 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200'
              >
                {loading ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    Signing in...
                  </>
                ) : (
                  'Access Dashboard'
                )}
              </Button>
            </form>
          </div>

          <div className='w-full text-center'>
            <p className='rounded-md border border-gray-100 bg-gray-50 p-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400'>
              This admin area is restricted to authorized personnel only.
              Unauthorized access attempts may be logged and reported.
            </p>
          </div>

          <div className='flex flex-col px-8 text-center text-sm text-zinc-600 dark:text-zinc-400'>
            Need help accessing your account?{' '}
            <span className='font-medium text-black underline underline-offset-4 hover:text-black/80 dark:text-zinc-100 dark:hover:text-zinc-300'>
              support@orbitaim.com
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
