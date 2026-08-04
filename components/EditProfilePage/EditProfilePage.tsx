'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import styles from './EditProfilePage.module.css';

const fetchUserProfile = async () => {
  const response = await fetch('/api/users/me');
  if (!response.ok) throw new Error('Не удалось загрузить данные');
  return response.json();
};

const updateProfileApi = async (updatedData: Record<string, string>) => {
  const response = await fetch('/api/users/me', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Не удалось обновить профиль');
  }

  return response.json();
};

export default function EditProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: user, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: updateProfileApi,
    onSuccess: updatedUser => {
      queryClient.setQueryData(['profile'], updatedUser);
      queryClient.setQueryData(['session'], updatedUser);
      router.push('/profile');
    },
    onError: (error: Error) => {
      setErrorMessage(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const updatedName = formData.get('name') as string;

    if (!updatedName || !updatedName.trim()) {
      setErrorMessage('Имя не может быть пустым');
      return;
    }

    mutate({ name: updatedName.trim() });
  };

  if (isLoading) {
    return <div className={styles.loading}>Загрузка данных...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Редактирование профиля</h1>

      {errorMessage && <p className={styles.error}>{errorMessage}</p>}

      <form onSubmit={handleSubmit} className={styles.form} key={user?.name}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email (нельзя изменить)</label>
          <input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className={styles.disabledInput}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name">Имя пользователя</label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user?.name || ''}
            disabled={isPending}
            placeholder="Введите ваше имя"
            required
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelButton}
            onClick={() => router.push('/profile')}
            disabled={isPending}
          >
            Отмена
          </button>
          <button
            type="submit"
            className={styles.saveButton}
            disabled={isPending}
          >
            {isPending ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </form>
    </div>
  );
}
