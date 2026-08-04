import { axiosInstance } from './api';
import type { Note, CreateNoteInput } from '../../types/note';
import type { User } from '../../types/user';

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
}

export interface RegisterData {
  email: string;
  username?: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateUserPayload {
  username: string;
}

export async function fetchNotes(
  search: string,
  page: number,
  perPage: number = 12,
  tag: string = ''
): Promise<FetchNotesResponse> {
  const params: Record<string, string | number> = { search, page, perPage };
  if (tag && tag !== 'all') params.tag = tag;

  const response = await axiosInstance.get<FetchNotesResponse>('/notes', {
    params,
  });
  return response.data;
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await axiosInstance.get<Note>(`/notes/${id}`);
  return response.data;
}

export async function createNote(noteData: CreateNoteInput): Promise<Note> {
  const response = await axiosInstance.post<Note>('/notes', noteData);
  return response.data;
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await axiosInstance.delete<Note>(`/notes/${id}`);
  return response.data;
}

export async function register(data: RegisterData): Promise<User> {
  const response = await axiosInstance.post<User>('/auth/register', data);
  return response.data;
}

export async function login(data: LoginData): Promise<User> {
  const response = await axiosInstance.post<User>('/auth/login', data);
  return response.data;
}

export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout');
}

export async function checkSession(): Promise<User> {
  const response = await axiosInstance.get<User>('/auth/session');
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await axiosInstance.get<User>('/users/me');
  return response.data;
}

export async function updateMe(data: UpdateUserPayload): Promise<User> {
  const response = await axiosInstance.patch<User>('/users/me', data);
  return response.data;
}
