import type { Metadata } from 'next';
import CreateNoteForm from '@/components/CreateNote/CreateNoteForm';

export const metadata: Metadata = {
  title: 'Create note',
  description:
    'Create a new personal note in your NoteHub workspace. Draft is saved automatically.',
  openGraph: {
    title: 'Create note | NoteHub',
    description: 'Form to create a new personal note.',
    url: 'https://notehub.com/notes/action/create',
    images: [
      {
        url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
        width: 1200,
        height: 630,
        alt: 'Create Note on NoteHub',
      },
    ],
  },
};

export default function CreateNote() {
  return (
    <main style={{ padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1.5rem' }}>
          Create note
        </h1>
        <CreateNoteForm />
      </div>
    </main>
  );
}
