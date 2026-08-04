'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import css from '@/components/SignInPage/SignInPage.module.css';

export default function SignInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const setUser = useAuthStore(state => state.setUser);

  const { mutate, isPending } = useMutation({
    mutationFn: login,
    onSuccess: userData => {
      queryClient.setQueryData(['session'], userData);

      setUser(userData);

      router.push('/profile');
    },
    onError: (error: unknown) => {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      const message =
        err.response?.data?.message || err.message || 'Authentication failed';
      setErrorMessage(message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    mutate({ email, password });
  };

  return (
    <main className={css.mainContent}>
      <form className={css.form} onSubmit={handleSubmit}>
        <h1 className={css.formTitle}>Sign in</h1>

        <div className={css.formGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            className={css.input}
            disabled={isPending}
            required
          />
        </div>

        <div className={css.formGroup}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            className={css.input}
            disabled={isPending}
            required
          />
        </div>

        <div className={css.actions}>
          <button
            type="submit"
            className={css.submitButton}
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Log in'}
          </button>
        </div>

        {errorMessage && <p className={css.error}>{errorMessage}</p>}
      </form>
    </main>
  );
}
