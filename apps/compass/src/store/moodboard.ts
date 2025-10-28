"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import {
  useQuery,
  useMutation,
  useQueryClient as useQueryClientHook,
} from "@tanstack/react-query";
import axios from "axios";
import { BEARER_TOKEN_KEY } from "@/lib/constants/localstorage";
import { useCallback, useEffect, useMemo } from "react";
import { useUploadThing } from "@/lib/uploadthing";

interface MoodboardImage {
  id: string;
  url: string;
  name: string;
  projectId: string;
  isUploaded: boolean;
  isUploading: boolean;
  uploadedAt: Date;
  createdAt: Date;
}

interface MoodboardState {
  projectId: string | null;
  localImages: MoodboardImage[];
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  tempUrls: Set<string>;
  setProjectId: (projectId: string) => void;
  addLocalImage: (image: MoodboardImage) => void;
  removeLocalImage: (id: string) => void;
  clearLocalImages: () => void;
  revokeTempUrls: () => void;
}

export const useMoodboardStore = create<MoodboardState>()(
  persist(
    (set, get) => ({
      projectId: null,
      localImages: [],
      dragActive: false,
      tempUrls: new Set(),

      setProjectId: (projectId: string) => set({ projectId }),

      setDragActive: (active: boolean) => set({ dragActive: active }),

      addLocalImage: (image: MoodboardImage) =>
        set((state) => ({ localImages: [...state.localImages, image] })),

      removeLocalImage: (id: string) => {
        const state = get();
        const imageToDelete = state.localImages.find((img) => img.id === id);
        if (imageToDelete && state.tempUrls.has(imageToDelete.url)) {
          URL.revokeObjectURL(imageToDelete.url);
          state.tempUrls.delete(imageToDelete.url);
        }
        set((state) => ({
          localImages: state.localImages.filter((img) => img.id !== id),
        }));
      },

      clearLocalImages: () => {
        const state = get();
        state.localImages.forEach((img) => {
          if (state.tempUrls.has(img.url)) {
            URL.revokeObjectURL(img.url);
            state.tempUrls.delete(img.url);
          }
        });
        set({ localImages: [] });
      },

      revokeTempUrls: () => {
        const state = get();
        state.tempUrls.forEach((url) => URL.revokeObjectURL(url));
        set({ tempUrls: new Set() });
      },
    }),
    {
      name: "moodboard-local-state",
      partialize: (state) => ({
        localImages: state.localImages.filter((img) => !img.isUploading), // Only persist completed
        dragActive: state.dragActive,
      }),
      onRehydrateStorage: () => (state) => {
        // Cleanup on rehydrate
        if (state) state.revokeTempUrls();
      },
    }
  )
);

// Custom hook for moodboard data, integrating queries and mutations
// Usage: const { images, isLoading, isUploading, uploadImage, deleteImage } = useMoodboard(projectId);
export function useMoodboard(projectId: string) {
  const queryClient = useQueryClientHook();
  const setProjectId = useMoodboardStore((state) => state.setProjectId);
  const addLocalImage = useMoodboardStore((state) => state.addLocalImage);
  const removeLocalImage = useMoodboardStore((state) => state.removeLocalImage);
  const clearLocalImages = useMoodboardStore((state) => state.clearLocalImages);
  const dragActive = useMoodboardStore((state) => state.dragActive);
  const setDragActive = useMoodboardStore((state) => state.setDragActive);
  const localImages = useMoodboardStore((state) => state.localImages);
  const tempUrls = useMoodboardStore((state) => state.tempUrls);
  const isUploadingState = localImages.some((img) => img.isUploading); // Derive from locals

  useEffect(() => {
    setProjectId(projectId);
  }, [projectId, setProjectId]);

  // Fetch query
  const {
    data: fetchedImages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["moodboard", projectId],
    queryFn: async () => {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/moodboard/${projectId}`, // Fixed typo
        { withCredentials: true }
      );
      return (response.data.images || []).map((img: MoodboardImage) => ({
        id: img.id,
        url: img.url,
        name: img.name,
        projectId: img.projectId || projectId,
        isUploaded: true,
        isUploading: false,
        uploadedAt: new Date(img.uploadedAt || img.createdAt),
        createdAt: new Date(img.createdAt),
      }));
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!projectId,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load moodboard images");
      console.error("Moodboard fetch error:", error);
    }
  }, [error]);

  // Combined images
  const images = useMemo(
    () => [...fetchedImages, ...localImages.filter((img) => img.isUploading)],
    [fetchedImages, localImages]
  );

  const bearerToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(BEARER_TOKEN_KEY);
  }, []);

  const { startUpload, isUploading: uploadThingUploading } = useUploadThing(
    "imageUploader",
    {
      onClientUploadComplete: (res) => {
        toast.success("Upload complete!");
        if (res) {
          clearLocalImages();
          setTimeout(() => {
            queryClient.invalidateQueries({
              queryKey: ["moodboard", projectId],
            });
          }, 0);
        }
      },
      onUploadError: (error) => {
        console.error("Upload error:", error);
        toast.error(`Upload failed: ${error.message}`);
        clearLocalImages();
      },
      headers: async () => ({ Authorization: `Bearer ${bearerToken}` }),
    }
  );

  const uploadImage = useCallback(
    async (file: File) => {
      if (!bearerToken) {
        toast.error("No authentication token available");
        return;
      }

      try {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const tempUrl = URL.createObjectURL(file);
        tempUrls.add(tempUrl);

        const tempImage: MoodboardImage = {
          id: tempId,
          url: tempUrl,
          name: file.name,
          isUploaded: false,
          projectId,
          isUploading: true,
          uploadedAt: new Date(),
          createdAt: new Date(),
        };

        addLocalImage(tempImage);
        await startUpload([file], { projectId });
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload image");

        removeLocalImage(`temp-${Date.now()}`);
      }
    },
    [
      projectId,
      startUpload,
      bearerToken,
      addLocalImage,
      removeLocalImage,
      tempUrls,
    ]
  );

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      queryClient.setQueryData<MoodboardImage[]>(
        ["moodboard", projectId],
        (old) => (old ? old.filter((img) => img.id !== id) : [])
      );

      await axios.delete(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/moodboard/${projectId}/images/${id}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${bearerToken}` },
        }
      );

      queryClient.invalidateQueries({ queryKey: ["moodboard", projectId] });
    },
    onSuccess: () => {
      toast.success("Image removed");
    },
    onError: (error) => {
      console.error("Delete failed:", error);
      toast.error("Failed to delete image");
      queryClient.invalidateQueries({ queryKey: ["moodboard", projectId] });
    },
    onMutate: async (id: string) => {
      removeLocalImage(id);
    },
  });

  const deleteImage = useCallback(
    (id: string) => {
      deleteMutation.mutate(id);
    },
    [deleteMutation]
  );

  useEffect(() => {
    return () => {
      useMoodboardStore.getState().revokeTempUrls();
    };
  }, []);

  return {
    images,
    isUploading: uploadThingUploading || isUploadingState,
    isLoading,
    dragActive,
    setDragActive,
    uploadImage,
    deleteImage,
  };
}
