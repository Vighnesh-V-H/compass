"use client";

import { useMoodboard } from "@/hooks/use-moodboard";
import { toast } from "sonner";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils"; // Assuming you have a utility for class concatenation
import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";

function Moodboard() {
  const { images, deleteImage, isUploading, uploadImage } = useMoodboard();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const processFiles = (files: FileList) => {
    Array.from(files).forEach((file) => {
      if (file.type.startsWith("image/")) {
        uploadImage(file);
      } else {
        toast.error(`${file.name} is not an image`);
      }
    });
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      processFiles(e.target.files);
      e.target.value = ""; // Reset input
    },
    [uploadImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);
      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [uploadImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  }, []);

  const handleAddImageClick = () => {
    fileInputRef.current?.click();
  };

  const getRandomRotation = useCallback(() => {
    const rotations = [-3, -1, 1, 3];
    return rotations[Math.floor(Math.random() * rotations.length)];
  }, []);

  return (
    <div
      className={cn(
        "relative w-full min-h-screen p-4 transition-colors duration-300",
        isDraggingOver && "bg-primary/10"
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}>
      <input
        type='file'
        ref={fileInputRef}
        multiple
        accept='image/*'
        onChange={handleFileChange}
        className='hidden'
      />

      {isDraggingOver && (
        <div className='absolute inset-0 z-40 flex items-center justify-center pointer-events-none'>
          <div className='p-8 text-lg font-semibold border-2 border-dashed rounded-lg border-primary text-primary bg-background/80'>
            Drop images anywhere
          </div>
        </div>
      )}

      <div className='flex flex-wrap justify-center gap-6 p-4'>
        {images.length === 0 && !isUploading && !isDraggingOver && (
          <div className='text-center text-muted-foreground mt-20'>
            <h2 className='text-2xl font-semibold'>Your Moodboard is Empty</h2>
            <p>Drop images here or click the + button to add them.</p>
          </div>
        )}

        {images.map((image) => (
          <div
            key={image.id}
            className='relative group w-60 h-60 overflow-hidden shadow-lg rounded-lg transition-transform duration-300 hover:z-10 hover:scale-105'
            style={{ transform: `rotate(${getRandomRotation()}deg)` }}>
            <div className='relative w-full h-full'>
              <Image
                src={image.url}
                alt={image.name}
                priority
                fill
                sizes='(max-width: 768px) 100vw, 300px'
                className='object-cover'
              />
              {image.isUploading && (
                <div className='absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg'>
                  <div className='text-white text-sm'>Uploading...</div>
                </div>
              )}
            </div>
            <Button
              onClick={() => deleteImage(image.id)}
              disabled={image.isUploading}
              className='absolute top-2 right-2 bg-destructive text-destructive-foreground h-8 w-8 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-20 flex items-center justify-center text-sm'>
              X
            </Button>
          </div>
        ))}
      </div>

      <Button
        onClick={handleAddImageClick}
        disabled={isUploading}
        className='fixed bottom-8 right-8 bg-primary text-primary-foreground h-14 w-14 rounded-full shadow-lg flex items-center justify-center text-3xl font-bold z-30 hover:bg-primary/90 transition-all active:scale-95 disabled:bg-muted-foreground disabled:cursor-not-allowed'>
        <PlusIcon className='size-8 text-center' />
      </Button>

      {isUploading && (
        <div className='fixed bottom-8 left-8 bg-background border border-border p-3 rounded-lg shadow-lg'>
          <p className='text-sm animate-pulse'>Uploading images...</p>
        </div>
      )}
    </div>
  );
}

export default Moodboard;