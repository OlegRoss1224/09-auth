import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from '@tanstack/react-query';
import { fetchNotes } from '@/lib/api/clientApi';
import NotesClient from './Notes.client';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentTag = slug && slug[0] ? slug[0] : 'all';

  const tagTitle =
    currentTag === 'all'
      ? 'Все заметки'
      : currentTag.charAt(0).toUpperCase() + currentTag.slice(1);

  const title = `Тег: ${tagTitle}`;
  const description = `Просмотр и фильтрация ваших заметок по тегу "${currentTag}".`;

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
      url: `https://notehub.com/${currentTag}`,
      images: [
        {
          url: 'https://goit.global',
          width: 1200,
          height: 630,
          alt: `Filtered notes by tag ${tagTitle}`,
        },
      ],
    },
  };
}

export default async function NotesPage({ params }: PageProps) {
  const queryClient = new QueryClient();

  const { slug } = await params;
  const currentTag = slug && slug[0] ? slug[0] : 'all';
  const apiTag = currentTag === 'all' ? '' : currentTag;

  await queryClient.prefetchQuery({
    queryKey: ['notes', '', 1, 12, apiTag],
    queryFn: () => fetchNotes('', 1, 12, apiTag),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={currentTag} />
    </HydrationBoundary>
  );
}
