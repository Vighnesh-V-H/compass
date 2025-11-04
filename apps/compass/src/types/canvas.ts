export interface FrameData {
  id: string;
  left: number;
  top: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface FrameProps extends FrameData {
  onResize?: (id: string, width: number, height: number) => void;
  onMove?: (id: string, left: number, top: number) => void;
  onDelete?: (id: string) => void;
  zoom?: number;
}
