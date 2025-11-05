import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081/api";

export interface CanvasStateData {
  elements: unknown[];
  zoom: number;
  pan: { x: number; y: number };
  timestamp: number;
}

export interface SaveCanvasResponse {
  success: boolean;
  message: string;
  timestamp: number;
}

export interface LoadCanvasResponse {
  success: boolean;
  canvasState: string | null;
  source: "cache" | "database" | "none";
}

export const canvasApi = {
  loadCanvas: async (projectId: string): Promise<CanvasStateData | null> => {
    const response = await axios.get<LoadCanvasResponse>(
      `${API_BASE_URL}/canvas/${projectId}`,
      {
        withCredentials: true,
      }
    );

    if (response.data.success && response.data.canvasState) {
      return JSON.parse(response.data.canvasState);
    }

    return null;
  },

  /**
   * Save canvas state to server
   */
  saveCanvas: async (
    projectId: string,
    canvasState: CanvasStateData
  ): Promise<SaveCanvasResponse> => {
    const response = await axios.post<SaveCanvasResponse>(
      `${API_BASE_URL}/canvas/${projectId}`,
      {
        canvasState: JSON.stringify(canvasState),
        timestamp: canvasState.timestamp,
      },
      {
        withCredentials: true,
      }
    );

    return response.data;
  },
};
