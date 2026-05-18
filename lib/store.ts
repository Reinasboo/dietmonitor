import { create } from 'zustand';
import { Entry } from './patterns';

interface EntryStore {
  entries: Entry[];
  loading: boolean;
  error: string | null;
  setEntries: (entries: Entry[]) => void;
  appendEntries: (entries: Entry[]) => void;
  addEntry: (entry: Entry) => void;
  removeEntry: (id: string) => void;
  updateEntry: (id: string, updates: Partial<Entry>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useEntryStore = create<EntryStore>((set) => ({
  entries: [],
  loading: false,
  error: null,
  setEntries: (entries) => set({ entries }),
  appendEntries: (entries) =>
    set((state) => ({
      entries: [...state.entries, ...entries],
    })),
  addEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries],
    })),
  removeEntry: (id) =>
    set((state) => ({
      entries: state.entries.filter((e) => e.id !== id),
    })),
  updateEntry: (id, updates) =>
    set((state) => ({
      entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
