'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import styles from './ProfilePage.module.css';

const fetchUserProfile = async () => {
  const response = await fetch('/api/users/me');
  if (!response.ok) {
    throw new Error('Не удалось загрузить данные профиля');
  }
  return response.json();
};

export default function ProfilePage() {
  const {
    data: user,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile'],
    queryFn: fetchUserProfile,
  });

  if (isLoading) {
    return <div className={styles.loading}>Загрузка профиля...</div>;
  }

  if (error || !user) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.error}>
          Ошибка: {(error as Error)?.message || 'Вы не авторизованы'}
        </p>
        <Link href="/login" className={styles.loginLink}>
          Войти в аккаунт
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мой профиль</h1>

      <div className={styles.card}>
        <div className={styles.infoGroup}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user.email}</span>
        </div>

        {user.name && (
          <div className={styles.infoGroup}>
            <span className={styles.label}>Имя:</span>
            <span className={styles.value}>{user.name}</span>
          </div>
        )}

        <Link href="/profile/edit" className={styles.editButton}>
          Редактировать профиль
        </Link>
      </div>
    </div>
  );
}
