"use client";

import { ZoomIn, ZoomOut, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore } from "@/store/canvas-store";

export function ZoomButton() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useCanvasStore();

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={zoomOut}
        className='rounded-full px-3 py-1 h-8'>
        <ZoomOut className='h-4 w-4' />
      </Button>
      <span className='text-sm font-medium min-w-[4rem] text-center'>
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant='outline'
        size='sm'
        onClick={zoomIn}
        className='rounded-full px-3 py-1 h-8'>
        <ZoomIn className='h-4 w-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={resetZoom}
        className='rounded-full px-3 py-1 h-8'
        title='Reset Zoom'>
        <Maximize className='h-4 w-4' />
      </Button>
    </div>
  );
}
