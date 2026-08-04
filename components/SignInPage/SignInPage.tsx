'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import styles from './SignInPage.module.css';

const loginUserApi = async (data: Record<string, string>) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Неверный email или пароль');
  }

  return response.json();
};

export default function SignInPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: loginUserApi,
    onSuccess: userData => {
      queryClient.setQueryData(['session'], userData);
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.push('/notes');
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
      setErrorMessage('Пожалуйста, заполните все поля');
      return;
    }

    mutate({ email, password });
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Вход в аккаунт</h1>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            disabled={isPending}
            required
            placeholder="example@mail.com"
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            name="password"
            disabled={isPending}
            required
            placeholder="Введите ваш пароль"
          />
        </div>

        <button type="submit" className={styles.button} disabled={isPending}>
          {isPending ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
