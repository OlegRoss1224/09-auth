'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotes, deleteNote } from '../../lib/api/clientApi';
import type { Note } from '../../types/note';
import css from './NoteList.module.css';

interface NoteListProps {
  search?: string;
  page?: number;
  tag?: string;
}

export const NoteList: React.FC<NoteListProps> = ({
  search = '',
  page = 1,
  tag = 'all',
}) => {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['notes', { search, page, tag }],
    queryFn: () => fetchNotes(search, page, 12, tag),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: error => {
      console.error(
        'Ошибка при удалении карточки через TanStack Query:',
        error
      );
    },
  });

  if (isLoading) return <div className={css.loading}>Загрузка заметок...</div>;
  if (error)
    return <div className={css.error}>Ошибка: {(error as Error).message}</div>;

  const notesList: Note[] = data?.notes || (Array.isArray(data) ? data : []);

  if (notesList.length === 0) {
    return <p className={css.empty}>Нотаток не знайдено</p>;
  }

  return (
    <ul className={css.list}>
      {notesList.map(({ id, title, content, tag }) => (
        <li key={id} className={css.listItem}>
          <h2 className={css.title}>{title}</h2>
          <p className={css.content}>{content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{tag}</span>
            <Link href={`/notes/${id}`} className={css.viewLink}>
              View details
            </Link>
            <button
              className={css.button}
              onClick={() => deleteMutation.mutate(id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
};
