import { create } from "zustand";
import { debounce } from "lodash";
import { setToLocalStorage, getFromLocalStorage } from "@/lib/localstorage";

interface CanvasState {
  canvasJSON: string; // Serialized canvas state from Fabric's toJSON()
}

export type ToolType =
  | "select"
  | "rectangle"
  | "circle"
  | "triangle"
  | "line"
  | "draw"
  | "eraser"
  | "frame"
  | "text"
  | "hand"
  | null;

interface CanvasStore {
  zoom: number;
  pan: { x: number; y: number };
  selectedTool: ToolType;
  isDrawing: boolean;
  canvasHistory: CanvasState[];
  historyIndex: number;
  shouldRestore: boolean;
  projectId: string | null;

  setProjectId: (projectId: string | null) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;

  setPan: (pan: { x: number; y: number }) => void;
  resetPan: () => void;

  setSelectedTool: (tool: ToolType) => void;

  setIsDrawing: (isDrawing: boolean) => void;

  addToHistory: (state: CanvasState) => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getCurrentHistoryState: () => CanvasState | null;
  clearRestoreFlag: () => void;

  resetCanvas: () => void;
  saveToStorage: (projectId?: string) => void;
  loadFromStorage: (projectId?: string) => void;
  loadFromServer: (serverState: CanvasState) => void;
}

const CANVAS_STORAGE_KEY = "canvas-state";
const DEBOUNCE_DELAY = 500;

const debouncedSave = debounce((state: Partial<CanvasStore>) => {
  const dataToSave = {
    zoom: state.zoom,
    pan: state.pan,
    canvasHistory: state.canvasHistory,
    historyIndex: state.historyIndex,
  };
  setToLocalStorage(CANVAS_STORAGE_KEY, dataToSave);
  console.log("Canvas state saved to localStorage");
}, DEBOUNCE_DELAY);

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedTool: null,
  isDrawing: false,
  canvasHistory: [],
  historyIndex: -1,
  shouldRestore: false,
  projectId: null,

  setProjectId: (projectId: string | null) => set({ projectId }),

  setZoom: (zoom: number) => {
    set({ zoom });
    debouncedSave(get());
  },
  zoomIn: () =>
    set((state: CanvasStore) => {
      const newZoom = Math.min(state.zoom + 0.1, 3);
      debouncedSave({ ...state, zoom: newZoom });
      return { zoom: newZoom };
    }),
  zoomOut: () =>
    set((state: CanvasStore) => {
      const newZoom = Math.max(state.zoom - 0.1, 0.1);
      debouncedSave({ ...state, zoom: newZoom });
      return { zoom: newZoom };
    }),
  resetZoom: () => {
    set({ zoom: 1 });
    debouncedSave(get());
  },

  setPan: (pan: { x: number; y: number }) => {
    set({ pan });
    debouncedSave(get());
  },
  resetPan: () => {
    set({ pan: { x: 0, y: 0 } });
    debouncedSave(get());
  },

  setSelectedTool: (tool: ToolType) => set({ selectedTool: tool }),

  setIsDrawing: (isDrawing: boolean) => set({ isDrawing }),

  addToHistory: (state: CanvasState) =>
    set((current: CanvasStore) => {
      const newHistory = current.canvasHistory.slice(
        0,
        current.historyIndex + 1
      );
      newHistory.push(state);
      console.log(newHistory);
      const newState = {
        canvasHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
      debouncedSave({ ...current, ...newState });
      return newState;
    }),
  undo: () =>
    set((state: CanvasStore) => {
      if (state.historyIndex > 0) {
        const newState = {
          historyIndex: state.historyIndex - 1,
          shouldRestore: true,
        };
        debouncedSave({ ...state, ...newState });
        return newState;
      }
      return state;
    }),
  redo: () =>
    set((state: CanvasStore) => {
      if (state.historyIndex < state.canvasHistory.length - 1) {
        const newState = {
          historyIndex: state.historyIndex + 1,
          shouldRestore: true,
        };
        debouncedSave({ ...state, ...newState });
        return newState;
      }
      return state;
    }),
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().canvasHistory.length - 1,
  getCurrentHistoryState: () => {
    const state = get();
    if (
      state.historyIndex >= 0 &&
      state.historyIndex < state.canvasHistory.length
    ) {
      return state.canvasHistory[state.historyIndex];
    }
    return null;
  },
  clearRestoreFlag: () => set({ shouldRestore: false }),

  resetCanvas: () => {
    set({
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedTool: null,
      isDrawing: false,
      canvasHistory: [],
      historyIndex: -1,
      shouldRestore: false,
    });
    debouncedSave(get());
  },

  saveToStorage: (projectId?: string) => {
    const state = get();
    const pid = projectId || state.projectId;
    if (!pid) return;

    const storageKey = `${CANVAS_STORAGE_KEY}-${pid}`;
    const dataToSave = {
      zoom: state.zoom,
      pan: state.pan,
      canvasHistory: state.canvasHistory,
      historyIndex: state.historyIndex,
    };
    setToLocalStorage(storageKey, dataToSave);
    console.log("Canvas state saved to localStorage (immediate)");
  },

  loadFromStorage: (projectId?: string) => {
    const state = get();
    const pid = projectId || state.projectId;
    if (!pid) return;

    const storageKey = `${CANVAS_STORAGE_KEY}-${pid}`;
    const savedState = getFromLocalStorage<{
      zoom: number;
      pan: { x: number; y: number };
      canvasHistory: CanvasState[];
      historyIndex: number;
    }>(storageKey);

    if (savedState) {
      set({
        zoom: savedState.zoom ?? 1,
        pan: savedState.pan ?? { x: 0, y: 0 },
        canvasHistory: savedState.canvasHistory ?? [],
        historyIndex: savedState.historyIndex ?? -1,
        shouldRestore:
          savedState.canvasHistory && savedState.canvasHistory.length > 0,
      });
      console.log("Canvas state loaded from localStorage");
    }
  },

  loadFromServer: (serverState: CanvasState) => {
    set({
      canvasHistory: [serverState],
      historyIndex: 0,
      shouldRestore: true,
    });
    console.log("Canvas state loaded from server");
  },
}));
