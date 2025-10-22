"use client";

import { useMoodboard } from "@/hooks/use-moodboard";
import { toast } from "sonner";
import Image from "next/image";
import { useCallback } from "react";

function Moodboard() {
  const { images, deleteImage, isUploading, uploadImage } = useMoodboard();

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          uploadImage(file);
        } else {
          toast.error(`${file.name} is not an image`);
        }
      });
    },
    [uploadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const files = e.dataTransfer.files;
      if (!files) return;

      Array.from(files).forEach((file) => {
        if (file.type.startsWith("image/")) {
          uploadImage(file);
        } else {
          toast.error(`${file.name} is not an image`);
        }
      });
    },
    [uploadImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  return (
    <div className='w-full p-4'>
      <div className='mb-6'>
        <h2 className='text-2xl font-bold mb-4'>Moodboard</h2>

        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className='border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors'>
          <input
            type='file'
            id='file-upload'
            multiple
            accept='image/*'
            onChange={handleFileChange}
            className='hidden'
          />
          <label
            htmlFor='file-upload'
            className='cursor-pointer flex flex-col items-center gap-2'>
            <div className='text-4xl'>📁</div>
            <p className='text-sm text-muted-foreground'>
              Drop images here or click to upload
            </p>
            <p className='text-xs text-muted-foreground'>
              Supports: JPG, PNG, GIF, WebP
            </p>
          </label>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
        {images.map((image) => (
          <div key={image.id} className='relative group'>
            <div className='relative w-full h-48'>
              <Image
                src={image.url}
                alt={image.name}
                fill
                className='object-cover rounded-lg'
              />
              {image.isUploading && (
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                  <div className='text-white text-sm'>Uploading...</div>
                </div>
              )}
            </div>
            <button
              onClick={() => deleteImage(image.id)}
              disabled={image.isUploading}
              className='absolute top-2 right-2 bg-destructive text-destructive-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50'>
              ×
            </button>
            <p className='text-sm mt-2 truncate'>{image.name}</p>
          </div>
        ))}
      </div>

      {isUploading && (
        <div className='fixed bottom-4 right-4 bg-background border border-border p-4 rounded-lg shadow-lg'>
          <p className='text-sm'>Uploading images...</p>
        </div>
      )}
    </div>
  );
}

export default Moodboard;
