"use client";

import { createContext, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useUploadThing } from "@/lib/uploadthing";

interface MoodboardImage {
  id: string;
  url: string;
  name: string;
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

export function MoodboardProvider({ children }: { children: React.ReactNode }) {
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log("Upload Completed", res);
      toast.success("Upload complete!");

      if (res) {
        const currentImages = watch("images");
        const permanentImages = currentImages.filter((img) => !img.isUploading);

        const newImages = res.map((file) => ({
          id: file.key,
          url: file.url,
          name: file.name,
          isUploaded: true,
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
    onUploadBegin: (fileName) => {
      console.log("Upload started for:", fileName);
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
        isUploading: true,
        uploadedAt: new Date(),
      };

      setValue("images", [...watch("images"), tempImage]);

      await startUpload([file]);
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
