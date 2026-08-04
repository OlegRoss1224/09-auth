import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { fetchNoteById } from '@/lib/api';
import NoteDetailsClient from './NoteDetails.client';
import { Metadata } from 'next';

interface NoteDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: NoteDetailPageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    const note = await fetchNoteById(id);

    const title = note?.title || 'Заметка';
    const description = note?.content
      ? `${note.content.substring(0, 150)}...`
      : 'Просмотр и редактирование вашей заметки в NoteHub.';

    return {
      title,
      description,
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: `${title} | NoteHub`,
        description,
        url: `https://notehub.com/${id}`,
        images: [
          {
            url: 'https://goit.global',
            width: 1200,
            height: 630,
            alt: `Preview of note: ${title}`,
          },
        ],
      },
    };
  } catch {
    return {
      title: 'Заметка не найдена',
      description: 'Запрашиваемую заметку не удалось найти или она недоступна.',
      openGraph: {
        title: 'Заметка не найдена | NoteHub',
        description: 'Запрашиваемую заметку не удалось найти.',
        url: `https://notehub.com/notes/${id}`,
        images: [
          {
            url: 'https://notehub.com',
            width: 1200,
            height: 630,
            alt: 'Note not found',
          },
        ],
      },
    };
  }
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { id } = await params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  );
}
