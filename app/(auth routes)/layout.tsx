'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const fetchSession = async () => {
  const response = await fetch('/api/auth/session');
  if (!response.ok) return null;
  return response.json();
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { data: user, isLoading } = useQuery({
    queryKey: ['session'],
    queryFn: fetchSession,
    retry: false,
  });

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/notes/filter/all');
    }
  }, [user, isLoading, router]);

  if (isLoading) return <div>Загрузка...</div>;

  return <>{children}</>;
}
