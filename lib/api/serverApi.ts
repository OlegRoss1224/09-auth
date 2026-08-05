import { cookies } from 'next/headers';
import { AxiosResponse } from 'axios';
import { axiosInstance } from './api';
import type { Note } from '../../types/note';
import type { User } from '../../types/user';
import { FetchNotesResponse } from './clientApi';

export interface SessionResponse {
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

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

export async function getMe(): Promise<User> {
  const headers = await getServerHeaders();

  const response = await axiosInstance.get<User>('/users/me', headers);
  return response.data;
}

export async function checkSession(): Promise<AxiosResponse<SessionResponse>> {
  const headers = await getServerHeaders();

  const response = await axiosInstance.get<SessionResponse>(
    '/auth/session',
    headers
  );

  return response;
}
