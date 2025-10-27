"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useUploadThing } from "@/lib/uploadthing";
import { BEARER_TOKEN_KEY } from "@/lib/constants/localstorage";

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

interface MoodboardContextType {
  images: MoodboardImage[];
  isUploading: boolean;
  isLoading: boolean;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
}

export const MoodboardContext = createContext<MoodboardContextType | undefined>(
  undefined
);

async function fetchMoodboardImages(
  projectId: string
): Promise<MoodboardImage[]> {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_SERVER_URL}/api/moodboar/${projectId}`,
    {
      withCredentials: true,
    }
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
}

export function MoodboardProvider({
  children,
  projectId,
}: {
  children: React.ReactNode;
  projectId: string;
}) {
  const [localImages, setLocalImages] = useState<MoodboardImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const tempUrlsRef = useRef<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const bearerToken = useMemo(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(BEARER_TOKEN_KEY);
  }, []);

  const {
    data: fetchedImages = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["moodboard", projectId],
    queryFn: () => fetchMoodboardImages(projectId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
    enabled: !!projectId && !!bearerToken,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load moodboard images");
      console.error("Moodboard fetch error:", error);
    }
  }, [error]);

  const images = useMemo(
    () => [...fetchedImages, ...localImages.filter((img) => img.isUploading)],
    [fetchedImages, localImages]
  );

  // useEffect(() => {
  //   return () => {
  //     tempUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  //     tempUrlsRef.current.clear();
  //   };
  // }, []);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      toast.success("Upload complete!");

      if (res) {
        setLocalImages((prev) => {
          const uploadingImages = prev.filter((img) => img.isUploading);
          uploadingImages.forEach((img) => {
            if (tempUrlsRef.current.has(img.url)) {
              URL.revokeObjectURL(img.url);
              tempUrlsRef.current.delete(img.url);
            }
          });
          return prev.filter((img) => !img.isUploading);
        });

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["moodboard", projectId] });
        }, 0);
      }

      setIsUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);

      setLocalImages((prev) => {
        const uploadingImages = prev.filter((img) => img.isUploading);
        uploadingImages.forEach((img) => {
          if (tempUrlsRef.current.has(img.url)) {
            URL.revokeObjectURL(img.url);
            tempUrlsRef.current.delete(img.url);
          }
        });
        return prev.filter((img) => !img.isUploading);
      });

      setIsUploading(false);
    },
    headers: async () => {
      return { Authorization: `Bearer ${bearerToken}` };
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!bearerToken) {
        toast.error("No authentication token available");
        return;
      }

      try {
        const tempId = `temp-${Date.now()}-${Math.random()}`;
        const tempUrl = URL.createObjectURL(file);
        tempUrlsRef.current.add(tempUrl);

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

        setLocalImages((prev) => [...prev, tempImage]);
        await startUpload([file], { projectId });
      } catch (error) {
        console.error("Upload failed:", error);
        toast.error("Failed to upload image");
        setIsUploading(false);
      }
    },
    [projectId, startUpload, bearerToken]
  );

  const deleteImage = useCallback(
    async (id: string) => {
      try {
        setLocalImages((prev) => {
          const imageToDelete = prev.find((img) => img.id === id);
          if (imageToDelete && tempUrlsRef.current.has(imageToDelete.url)) {
            URL.revokeObjectURL(imageToDelete.url);
            tempUrlsRef.current.delete(imageToDelete.url);
          }
          return prev.filter((img) => img.id !== id);
        });

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

        toast.success("Image removed");

        queryClient.invalidateQueries({ queryKey: ["moodboard", projectId] });
      } catch (error) {
        console.error("Delete failed:", error);
        toast.error("Failed to delete image");

        queryClient.invalidateQueries({ queryKey: ["moodboard", projectId] });
      }
    },
    [projectId, queryClient, bearerToken]
  );

  const contextValue = useMemo(
    () => ({
      dragActive,
      setDragActive,
      isUploading,
      isLoading,
      deleteImage,
      uploadImage,
      images,
    }),
    [dragActive, isUploading, isLoading, deleteImage, uploadImage, images]
  );

  return (
    <MoodboardContext.Provider value={contextValue}>
      {children}
    </MoodboardContext.Provider>
  );
}