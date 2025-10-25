"use client";

import { Undo2, Redo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HistoryControlsProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export function HistoryControls({
  onUndo,
  onRedo,
  canUndo = true,
  canRedo = true,
}: HistoryControlsProps) {
  return (
    <div className='flex items-center gap-2'>
      <Button
        variant='outline'
        size='sm'
        onClick={onUndo}
        disabled={!canUndo}
        className='rounded-full px-3 py-1 h-8'>
        <Undo2 className='w-4 h-4' />
      </Button>
      <Button
        variant='outline'
        size='sm'
        onClick={onRedo}
        disabled={!canRedo}
        className='rounded-full px-3 py-1 h-8'>
        <Redo2 className='w-4 h-4' />
      </Button>
    </div>
  );
}
