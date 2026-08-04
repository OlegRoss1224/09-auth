'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { fetchNotes } from '@/lib/api/clientApi';
import { SearchBox } from '@/components/SearchBox/SearchBox';
import { NoteList } from '@/components/NoteList/NoteList';
import { Pagination } from '@/components/Pagination/Pagination';
import css from '@/components/NotesPage/NotesPage.module.css';

interface NotesClientProps {
  tag: string;
}

export default function NotesClient({ tag }: NotesClientProps) {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 12;

  const [debouncedQuery] = useDebounce(query, 1000);

  const handleSearchChange = (value: string) => {
    setQuery(value);
    setPage(1);
  };

  const apiTag = tag === 'all' ? '' : tag;

  const { data, isLoading, isError } = useQuery({
    queryKey: ['notes', debouncedQuery, page, perPage, apiTag],
    queryFn: () => fetchNotes(debouncedQuery, page, perPage, apiTag),
    placeholderData: keepPreviousData,
  });

  const notesList = data?.notes || [];
  const totalPages = data?.totalPages || 1;

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox value={query} onChange={handleSearchChange} />
        {totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}

        <Link href="/notes/action/create" className={css.button}>
          Create note +
        </Link>
      </header>

      <main className={css.mainContent}>
        {isLoading && <p className={css.loader}>Загрузка карточек...</p>}
        {isError && <p className={css.error}>Ошибка загрузки данных!</p>}
        {!isLoading && !isError && notesList.length === 0 && (
          <p className={css.empty}>Коллекция пустая или ничего не найдено.</p>
        )}
        {notesList.length > 0 && <NoteList page={page} tag={tag} />}
      </main>
    </div>
  );
}
