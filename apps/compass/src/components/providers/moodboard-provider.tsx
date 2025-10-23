"use client";

import { createContext, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";
import { BEARER_TOKEN_KEY } from "@/lib/constants/localstorage";

interface MoodboardImage {
  id: string;
  url: string;
  name: string;
  projectid: string;
  isUploaded: boolean;
  isUploading: boolean;
  uploadedAt: Date;
}

interface MoodboardImages {
  images: MoodboardImage[];
}

interface MoodboardContextType {
  images: MoodboardImage[];
  isUploading: boolean;
  dragActive: boolean;
  setDragActive: (active: boolean) => void;
  uploadImage: (file: File) => Promise<void>;
  deleteImage: (id: string) => Promise<void>;
}

export const MoodboardContext = createContext<MoodboardContextType | undefined>(
  undefined
);

export function MoodboardProvider({
  children,
  projectid,
}: {
  children: React.ReactNode;
  projectid: string;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [bearerToken, setBearerToken] = useState<string | null>(null);

  useEffect(() => {
    const token = window.localStorage.getItem(BEARER_TOKEN_KEY);
    if (token && token !== bearerToken) {
      setBearerToken(token);
    }
  }, [bearerToken]);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      toast.success("Upload complete!");
      if (res) {
        const currentImages = watch("images");
        const permanentImages = currentImages.filter((img) => !img.isUploading);

        const newImages = res.map((file) => ({
          id: file.key,
          url: file.ufsUrl,
          name: file.name,
          isUploaded: true,
          projectid,
          isUploading: false,
          uploadedAt: new Date(),
        }));

        setValue("images", [...permanentImages, ...newImages]);
      }

      setIsUploading(false);
    },
    onUploadError: (error) => {
      console.error("Upload error:", error);
      toast.error(`Upload failed: ${error.message}`);

      const currentImages = watch("images");
      setValue(
        "images",
        currentImages.filter((img) => !img.isUploading)
      );

      setIsUploading(false);
    },
    headers: async () => {
      return { Authorization: `Bearer ${bearerToken}` };
    },
    onUploadBegin: () => {
      setIsUploading(true);
    },
  });

  const form = useForm<MoodboardImages>({
    defaultValues: {
      images: [],
    },
  });

  const { watch, setValue } = form;
  const images = watch("images");

  async function uploadImage(file: File) {
    try {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const tempImage: MoodboardImage = {
        id: tempId,
        url: URL.createObjectURL(file),
        name: file.name,
        isUploaded: false,
        projectid,
        isUploading: true,
        uploadedAt: new Date(),
      };

      setValue("images", [...watch("images"), tempImage]);

      await startUpload([file], { projectId: projectid });
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("Failed to upload image");
      setIsUploading(false);
    }
  }

  async function deleteImage(id: string) {
    setValue(
      "images",
      images.filter((img) => img.id !== id)
    );
    toast.success("Image removed");
  }

  return (
    <MoodboardContext.Provider
      value={{
        dragActive,
        setDragActive,
        isUploading,
        deleteImage,
        uploadImage,

        images,
      }}>
      {children}
    </MoodboardContext.Provider>
  );
}
