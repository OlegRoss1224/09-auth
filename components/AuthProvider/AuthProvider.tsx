'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { checkSession, getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const setUser = useAuthStore(state => state.setUser);
  const clearIsAuthenticated = useAuthStore(
    state => state.clearIsAuthenticated
  );

  const {
    data: sessionData,
    isLoading: isSessionLoading,
    isError: isSessionError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: checkSession,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getMe,
    enabled: !!sessionData,
    retry: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (sessionData && userData) {
      setUser(userData);
    }

    if (isSessionError || (!isSessionLoading && !sessionData)) {
      clearIsAuthenticated();
    }
  }, [
    sessionData,
    userData,
    isSessionLoading,
    isSessionError,
    setUser,
    clearIsAuthenticated,
  ]);

  if (isSessionLoading || (sessionData && isUserLoading)) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <span>Ініціалізація додатку...</span>
      </div>
    );
  }

  return <>{children}</>;
}
