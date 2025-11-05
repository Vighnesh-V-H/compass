import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { canvasApi, type CanvasStateData } from "@/lib/canvas-api";
import { toast } from "sonner";
import { useRef, useCallback } from "react";
import { debounce } from "lodash";

const DEBOUNCE_DELAY = 500; // 500ms debounce

export function useCanvasSync(projectId: string | null) {
  const queryClient = useQueryClient();
  const saveToastIdRef = useRef<string | number | null>(null);

  // Query to load canvas state
  const {
    data: canvasData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["canvas", projectId],
    queryFn: () => {
      if (!projectId) throw new Error("Project ID is required");
      return canvasApi.loadCanvas(projectId);
    },
    enabled: !!projectId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: 2,
  });

  // Mutation to save canvas state
  const saveMutation = useMutation({
    mutationFn: ({
      projectId,
      canvasState,
    }: {
      projectId: string;
      canvasState: CanvasStateData;
    }) => canvasApi.saveCanvas(projectId, canvasState),
    onMutate: () => {
      // Show saving toast
      if (saveToastIdRef.current) {
        toast.dismiss(saveToastIdRef.current);
      }
      saveToastIdRef.current = toast.loading("Saving canvas...");
    },
    onSuccess: () => {
      // Update toast to success
      if (saveToastIdRef.current) {
        toast.success("Canvas saved", {
          id: saveToastIdRef.current,
          duration: 2000,
        });
        saveToastIdRef.current = null;
      }

      // Invalidate and refetch canvas data
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ["canvas", projectId] });
      }
    },
    onError: (error) => {
      // Update toast to error
      if (saveToastIdRef.current) {
        toast.error("Failed to save canvas", {
          id: saveToastIdRef.current,
          description: error instanceof Error ? error.message : "Unknown error",
          duration: 3000,
        });
        saveToastIdRef.current = null;
      }
      console.error("Error saving canvas:", error);
    },
  });

  // Debounced save function
  const debouncedSaveRef = useRef(
    debounce((projectId: string, canvasState: CanvasStateData) => {
      saveMutation.mutate({ projectId, canvasState });
    }, DEBOUNCE_DELAY)
  );

  // Public save function
  const saveCanvasState = useCallback(
    (canvasState: CanvasStateData) => {
      if (!projectId) {
        console.warn("Cannot save canvas: projectId is null");
        return;
      }

      // Save to localStorage immediately
      try {
        localStorage.setItem(
          `canvas-state-${projectId}`,
          JSON.stringify(canvasState)
        );
      } catch (error) {
        console.error("Failed to save to localStorage:", error);
      }

      // Debounced server save
      debouncedSaveRef.current(projectId, canvasState);
    },
    [projectId]
  );

  // Immediate save (no debounce) - useful for important actions
  const saveCanvasStateImmediate = useCallback(
    (canvasState: CanvasStateData) => {
      if (!projectId) {
        console.warn("Cannot save canvas: projectId is null");
        return;
      }

      // Cancel any pending debounced saves
      debouncedSaveRef.current.cancel();

      // Save immediately
      saveMutation.mutate({ projectId, canvasState });
    },
    [projectId, saveMutation]
  );

  return {
    canvasData,
    isLoading,
    error,
    saveCanvasState,
    saveCanvasStateImmediate,
    isSaving: saveMutation.isPending,
  };
}
