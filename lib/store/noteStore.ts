import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftFields {
  title: string;
  content: string;
  tag: string;
}

interface NoteStore {
  draft: DraftFields;
  setDraft: (note: Partial<DraftFields>) => void;
  clearDraft: () => void;
}

const initialDraft: DraftFields = {
  title: '',
  content: '',
  tag: 'Todo',
};

export const useNoteStore = create<NoteStore>()(
  persist(
    set => ({
      draft: initialDraft,

      setDraft: note =>
        set(state => ({
          draft: { ...state.draft, ...note },
        })),

      clearDraft: () => set({ draft: initialDraft }),
    }),
    {
      name: 'notehub-draft-storage',

      partialize: state => ({ draft: state.draft }),
    }
  )
);
