'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchNoteById } from '../../lib/api/clientApi';
import css from './NoteDetails.module.css';

interface NoteDetailsProps {
  id: string;
}

export default function NoteDetails({ id }: NoteDetailsProps) {
  const {
    data: note,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    enabled: Boolean(id),
  });

  if (isLoading)
    return <div className={css.loading}>Загрузка деталей заметки...</div>;
  if (error)
    return <div className={css.error}>Ошибка: {(error as Error).message}</div>;
  if (!note) return <div className={css.notFound}>Заметка не найдена</div>;

  return (
    <div className={css.container}>
      <h1 className={css.title}>{note.title}</h1>
      <span className={css.tag}>{note.tag}</span>
      <p className={css.content}>{note.content}</p>
    </div>
  );
}
