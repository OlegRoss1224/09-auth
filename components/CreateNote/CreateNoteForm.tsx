'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNoteStore } from '@/lib/store/noteStore';
import { createNote } from '@/lib/api/clientApi';
import styles from './CreateNote.module.css';

export default function CreateNoteForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { draft, setDraft, clearDraft } = useNoteStore();
  const mutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      clearDraft();

      router.push('/notes/filter/all');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.title.trim() || !draft.content.trim()) return;

    mutation.mutate({ title: draft.title, content: draft.content, tag: '' });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={styles.form || ''}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      <div>
        <label
          htmlFor="title"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
        >
          Заголовок нотатки:
        </label>
        <input
          id="title"
          type="text"
          value={draft.title}
          onChange={e => setDraft({ title: e.target.value })}
          placeholder="Введіть заголовок..."
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
          required
        />
      </div>

      <div>
        <label
          htmlFor="content"
          style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
        >
          Текст нотатки:
        </label>
        <textarea
          id="content"
          value={draft.content}
          onChange={e => setDraft({ content: e.target.value })}
          placeholder="Почніть писати вашу нотатку тут..."
          rows={8}
          style={{
            width: '100%',
            padding: '0.5rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
            resize: 'vertical',
          }}
          required
        />
      </div>

      <button
        type="submit"
        disabled={mutation.isPending}
        style={{
          padding: '0.75rem',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: 'bold',
        }}
      >
        {mutation.isPending ? 'Збереження...' : 'Зберегти нотатку'}
      </button>
    </form>
  );
}
