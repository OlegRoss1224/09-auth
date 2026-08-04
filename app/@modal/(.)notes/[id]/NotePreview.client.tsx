'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchNoteById } from '@/lib/api';
import { Modal } from '@/components/Modal/Modal';
import type { Note } from '@/types/note';
import css from './NoteModal.module.css';

interface NotePreviewClientProps {
  id: string;
}

export default function NotePreviewClient({ id }: NotePreviewClientProps) {
  const router = useRouter();

  const {
    data: note,
    isLoading,
    isError,
  } = useQuery<Note>({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
    refetchOnMount: false,
  });

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal isOpen={true} onClose={handleClose}>
      <div
        className={css.modalContent}
        style={{ padding: '24px', position: 'relative' }}
      >
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#666',
            fontWeight: 'bold',
          }}
          aria-label="Close modal"
        >
          ✕
        </button>

        {isLoading && <p>Loading note details...</p>}
        {isError && <p>Error loading note.</p>}

        {note && (
          <>
            <h2 className={css.title} style={{ marginRight: '20px' }}>
              {note.title}
            </h2>

            {note.createdAt && (
              <p
                style={{
                  fontSize: '0.85rem',
                  color: '#888',
                  marginBottom: '12px',
                }}
              >
                Created at: {new Date(note.createdAt).toLocaleDateString()}
              </p>
            )}

            <p style={{ marginTop: '10px', color: '#444', lineHeight: '1.5' }}>
              {note.content}
            </p>

            {note.tag && (
              <span
                className={css.tag}
                style={{
                  display: 'inline-block',
                  marginTop: '14px',
                  color: 'blue',
                }}
              >
                #{note.tag}
              </span>
            )}

            <div style={{ marginTop: '20px', textAlign: 'right' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
