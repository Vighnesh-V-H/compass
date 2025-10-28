"use client";

import { useMoodboard } from "@/hooks/use-moodboard";
import { toast } from "sonner";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

function Moodboard() {
  const params = useParams();
  const projectId = params.projectid as string;
  const { images, deleteImage, isUploading, uploadImage } =
    useMoodboard(projectId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);

  const processFiles = useCallback(
    (files: FileList) => {
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

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files) return;
      processFiles(e.target.files);
      e.target.value = "";
    },
    [processFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDraggingOver(false);

      if (!e.dataTransfer.types.includes("Files")) return;

      if (e.dataTransfer.files?.length) {
        processFiles(e.dataTransfer.files);
      }
    },
    [processFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
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

  const handleDeleteClick = (key: string) => {
    setImageToDelete(key);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (imageToDelete) {
      deleteImage(imageToDelete);
      setDeleteDialogOpen(false);
      setImageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setImageToDelete(null);
  };

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
                className='object-cover select-none pointer-events-none'
                draggable={false}
              />
            </div>
            <Button
              onClick={() => handleDeleteClick(image.key)}
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Image</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this image? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant='outline' onClick={cancelDelete}>
              Cancel
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Moodboard;
