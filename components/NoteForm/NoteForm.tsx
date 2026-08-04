'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNoteStore } from '@/lib/store/noteStore';
import { createNote } from '../../lib/api/clientApi';
import css from './NoteForm.module.css';

export const NoteForm: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { draft, setDraft, clearDraft } = useNoteStore();

  const createMutation = useMutation({
    mutationFn: (noteData: { title: string; content: string; tag: string }) =>
      createNote(noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });

      clearDraft();

      router.push('/notes/filter/all');
    },
    onError: error => {
      console.error('Ошибка при создании заметки через TanStack Query:', error);
    },
  });

  const handleSubmitAction = (formData: FormData) => {
    const noteTitle = formData.get('title') as string;
    const noteContent = formData.get('content') as string;
    const noteTag = formData.get('tag') as string;

    if (!noteTitle.trim() || !noteTag) return;

    createMutation.mutate({
      title: noteTitle,
      content: noteContent,
      tag: noteTag,
    });
  };

  return (
    <form action={handleSubmitAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          type="text"
          defaultValue={draft.title}
          onChange={e => setDraft({ title: e.target.value })}
          className={css.input}
          required
          minLength={3}
          maxLength={50}
          placeholder="Enter title..."
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          defaultValue={draft.content}
          onChange={e => setDraft({ content: e.target.value })}
          className={css.textarea}
          maxLength={500}
          placeholder="Enter content..."
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          defaultValue={draft.tag || ''}
          onChange={e => setDraft({ tag: e.target.value })}
          className={css.select}
          required
        >
          <option value="" disabled>
            Select a tag...
          </option>
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          className={css.cancelButton}
          onClick={() => router.back()}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={css.submitButton}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? 'Creating...' : 'Create note'}
        </button>
      </div>
    </form>
  );
};
