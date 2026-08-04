'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    router.refresh();

    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  return <>{children}</>;
}
