import { Loader2, Cloud, CloudOff } from "lucide-react";

interface SaveIndicatorProps {
  isSaving: boolean;
  lastSaved?: Date | null;
}

export function SaveIndicator({ isSaving, lastSaved }: SaveIndicatorProps) {
  return (
    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
      {isSaving ? (
        <>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <Cloud className='h-4 w-4 text-green-500' />
          <span>Saved</span>
        </>
      ) : (
        <>
          <CloudOff className='h-4 w-4 text-orange-500' />
          <span>Not saved</span>
        </>
      )}
    </div>
  );
}
