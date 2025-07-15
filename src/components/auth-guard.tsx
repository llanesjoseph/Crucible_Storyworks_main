
'use client';

import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { LoaderCircle } from 'lucide-react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't do anything while auth is loading.
    if (isLoading) return;

    const isLoginPage = pathname === '/login';

    // If there's no user and we're not on the login page, redirect to login.
    if (!user && !isLoginPage) {
      router.push('/login');
    }

    // If there is a user and we're on the login page, redirect to the dashboard.
    if (user && isLoginPage) {
      router.push('/');
    }
  }, [user, isLoading, pathname, router]);

  // Determine if we should show the loading spinner.
  // This happens while auth is loading OR if a redirect is imminent.
  const showLoader = isLoading || (!user && pathname !== '/login') || (user && pathname === '/login');

  if (showLoader) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we're not loading and no redirect is needed, show the children.
  return <>{children}</>;
}
