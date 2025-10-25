"use client";

import { HistoryControls } from "@/components/canvas/tools/history";
import { ZoomButton } from "@/components/canvas/tools/zoom";
import { Toolbar } from "@/components/canvas/tools/toolbar";
import { useCanvasStore } from "@/store/canvas-store";

export function CanvasToolbar() {
  const { canUndo, canRedo, undo, redo } = useCanvasStore();

  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t'>
      <div className='container mx-auto px-4 py-3'>
        <div className='flex justify-between items-center'>
          <HistoryControls
            onUndo={undo}
            onRedo={redo}
            canUndo={canUndo()}
            canRedo={canRedo()}
          />
          <Toolbar />
          <ZoomButton />
        </div>
      </div>
    </div>
  );
}

export default CanvasToolbar;
