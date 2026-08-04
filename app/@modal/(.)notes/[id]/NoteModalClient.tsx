'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { fetchNoteById } from '@/lib/api';
import { Modal } from '@/components/Modal/Modal';
import css from './NoteModal.module.css';

interface NoteModalClientProps {
  id: string;
}

export default function NoteModalClient({ id }: NoteModalClientProps) {
  const router = useRouter();

  const {
    data: note,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
  });

  const handleClose = () => {
    router.back();
  };

  return (
    <Modal isOpen={true} onClose={handleClose}>
      <div className={css.modalContent}>
        {isLoading && <p>Loading note details...</p>}
        {isError && <p>Error loading note.</p>}

        {note && (
          <>
            <h2 className={css.title}>{note.title}</h2>
            <p className={css.text}>{note.content}</p>
            {note.tag && <span className={css.tag}>#{note.tag}</span>}
          </>
        )}
      </div>
    </Modal>
  );
}
