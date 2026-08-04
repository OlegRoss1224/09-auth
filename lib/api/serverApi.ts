import { cookies } from 'next/headers';
import { AxiosResponse } from 'axios';
import { axiosInstance } from './api';
import type { Note } from '../../types/note';
import { FetchNotesResponse } from './clientApi';

async function getServerHeaders() {
  const cookieStore = await cookies();
  return {
    headers: {
      Cookie: cookieStore.toString(),
    },
  };
}

export async function fetchNotes(
  search: string,
  page: number,
  perPage: number = 12,
  tag: string = ''
): Promise<FetchNotesResponse> {
  const params: Record<string, string | number> = { search, page, perPage };
  if (tag && tag !== 'all') params.tag = tag;

  const config = await getServerHeaders();
  const response = await axiosInstance.get<FetchNotesResponse>('/notes', {
    ...config,
    params,
  });
  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const config = await getServerHeaders();
  const response = await axiosInstance.get<Note>(`/notes/${id}`, config);
  return response.data;
}

export async function getMe() {
  const config = await getServerHeaders();
  const response = await axiosInstance.get('/users/me', config);
  return response.data;
}

export async function checkSession(): Promise<AxiosResponse<Note>> {
  const response = await axiosInstance.get<Note>('/auth/session');
  return response;
}
