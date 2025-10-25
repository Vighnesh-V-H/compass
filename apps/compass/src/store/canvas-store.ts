import { create } from "zustand";

interface CanvasState {
  elements: unknown[];
}

export type ToolType =
  | "select"
  | "rectangle"
  | "circle"
  | "triangle"
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

  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  zoom: 1,
  pan: { x: 0, y: 0 },
  selectedTool: null,
  isDrawing: false,
  canvasHistory: [],
  historyIndex: -1,

  setZoom: (zoom: number) => set({ zoom }),
  zoomIn: () =>
    set((state: CanvasStore) => ({ zoom: Math.min(state.zoom + 0.1, 3) })),
  zoomOut: () =>
    set((state: CanvasStore) => ({ zoom: Math.max(state.zoom - 0.1, 0.1) })),
  resetZoom: () => set({ zoom: 1 }),

  setPan: (pan: { x: number; y: number }) => set({ pan }),
  resetPan: () => set({ pan: { x: 0, y: 0 } }),

  setSelectedTool: (tool: ToolType) => set({ selectedTool: tool }),

  setIsDrawing: (isDrawing: boolean) => set({ isDrawing }),

  addToHistory: (state: CanvasState) =>
    set((current: CanvasStore) => {
      const newHistory = current.canvasHistory.slice(
        0,
        current.historyIndex + 1
      );
      newHistory.push(state);
      return {
        canvasHistory: newHistory,
        historyIndex: newHistory.length - 1,
      };
    }),
  undo: () =>
    set((state: CanvasStore) => {
      if (state.historyIndex > 0) {
        return { historyIndex: state.historyIndex - 1 };
      }
      return state;
    }),
  redo: () =>
    set((state: CanvasStore) => {
      if (state.historyIndex < state.canvasHistory.length - 1) {
        return { historyIndex: state.historyIndex + 1 };
      }
      return state;
    }),
  canUndo: () => get().historyIndex > 0,
  canRedo: () => get().historyIndex < get().canvasHistory.length - 1,

  resetCanvas: () =>
    set({
      zoom: 1,
      pan: { x: 0, y: 0 },
      selectedTool: null,
      isDrawing: false,
      canvasHistory: [],
      historyIndex: -1,
    }),
}));
