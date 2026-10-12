import { create } from 'zustand';

export type Mode = 'desktop' | 'motherboard' | 'lab';

export interface CameraGoal {
  key: number;
  /** World-space target the camera should look at. */
  target: [number, number, number];
  /** Desired distance from target; keeps current direction when omitted. */
  distance?: number;
  /** Direction from target to camera; keeps current direction when omitted. */
  direction?: [number, number, number];
}

interface AtlasState {
  mode: Mode;
  activeSim: string | null;
  activeQuiz: string | null;
  tourId: string | null;
  tourStep: number;
  selectedId: string | null;
  hiddenIds: string[];
  isolate: boolean;
  explodeTarget: number;
  rotate: boolean;
  resetKey: number;
  search: string;
  panel: 'browser' | 'detail' | null;
  labTab: 'sims' | 'quizzes';
  cameraGoal: CameraGoal | null;
  /** Incremented whenever a crossfade of the 3D scene should restart. */
  sceneKey: number;
  /** Bumped on select(id, focus=true) so the camera rig focuses exactly once. */
  focusKey: number;

  setMode: (mode: Mode) => void;
  setActiveSim: (id: string | null) => void;
  setActiveQuiz: (id: string | null) => void;
  startTour: (id: string | null) => void;
  setTourStep: (step: number) => void;
  select: (id: string | null, focus?: boolean) => void;
  toggleHidden: (id: string) => void;
  setHidden: (ids: string[]) => void;
  setIsolate: (v: boolean) => void;
  setExplodeTarget: (v: number) => void;
  setRotate: (v: boolean) => void;
  reset: () => void;
  setSearch: (q: string) => void;
  setPanel: (p: 'browser' | 'detail' | null) => void;
  setLabTab: (t: 'sims' | 'quizzes') => void;
  requestCamera: (target: [number, number, number], distance?: number, direction?: [number, number, number]) => void;
  clearCamera: () => void;
}

const prefersReduced =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const REDUCED_MOTION = prefersReduced;

let cameraKey = 0;

export const useAtlas = create<AtlasState>((set) => ({
  mode: 'desktop',
  activeSim: null,
  activeQuiz: null,
  tourId: null,
  tourStep: 0,
  selectedId: null,
  hiddenIds: [],
  isolate: false,
  explodeTarget: 0,
  rotate: false,
  resetKey: 0,
  search: '',
  panel: null,
  labTab: 'sims',
  cameraGoal: null,
  sceneKey: 0,
  focusKey: 0,

  setMode: (mode) =>
    set((s) => ({
      mode,
      sceneKey: s.sceneKey + 1,
      selectedId: null,
      hiddenIds: [],
      isolate: false,
      explodeTarget: 0,
      tourId: null,
      tourStep: 0,
      activeQuiz: null,
      search: '',
    })),
  setActiveSim: (id) => set({ activeSim: id }),
  setActiveQuiz: (id) => set({ activeQuiz: id }),
  startTour: (id) => set({ tourId: id, tourStep: 0 }),
  setTourStep: (step) => set({ tourStep: step }),
  select: (id, focus = true) =>
    set((s) => {
      const next: Partial<AtlasState> = { selectedId: id };
      if (id && s.hiddenIds.includes(id)) {
        next.hiddenIds = s.hiddenIds.filter((h) => h !== id);
      }
      if (id && focus) {
        next.focusKey = s.focusKey + 1;
      }
      return next;
    }),
  toggleHidden: (id) =>
    set((s) => ({
      hiddenIds: s.hiddenIds.includes(id) ? s.hiddenIds.filter((h) => h !== id) : [...s.hiddenIds, id],
      selectedId: s.hiddenIds.includes(id) ? s.selectedId : s.selectedId === id ? null : s.selectedId,
    })),
  setHidden: (ids) => set({ hiddenIds: ids }),
  setIsolate: (v) => set({ isolate: v }),
  setExplodeTarget: (v) => set({ explodeTarget: Math.max(0, Math.min(1, v)) }),
  setRotate: (v) => set({ rotate: v }),
  reset: () =>
    set((s) => ({
      selectedId: null,
      hiddenIds: [],
      isolate: false,
      explodeTarget: 0,
      rotate: false,
      tourId: null,
      tourStep: 0,
      activeQuiz: null,
      search: '',
      resetKey: s.resetKey + 1,
    })),
  setSearch: (q) => set({ search: q }),
  setPanel: (p) => set({ panel: p }),
  setLabTab: (t) => set({ labTab: t }),
  requestCamera: (target, distance, direction) => {
    cameraKey += 1;
    set({ cameraGoal: { key: cameraKey, target, distance, direction } });
  },
  clearCamera: () => set({ cameraGoal: null }),
}));

/** Selector: is a part currently visible in the scene? */
export function isPartVisible(hiddenIds: string[], isolate: boolean, selectedId: string | null, id: string): boolean {
  if (isolate) return id === selectedId;
  return !hiddenIds.includes(id);
}
