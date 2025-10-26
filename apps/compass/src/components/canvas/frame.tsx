"use client";

import { useState, useRef, useEffect } from "react";
import { Canvas as FabricCanvas } from "fabric";

export interface FrameData {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FrameProps {
  frame: FrameData;
  zoom: number;
  pan: { x: number; y: number };
  isSelected: boolean;
  isSelectTool: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
  onDelete: (id: string) => void;
}

export function Frame({
  frame,
  zoom,
  pan,
  isSelected,
  isSelectTool,
  onSelect,
  onMove,
  onDelete,
}: FrameProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Initialize Fabric canvas inside the frame
  useEffect(() => {
    if (!canvasRef.current) return;

    const fabricCanvas = new FabricCanvas(canvasRef.current, {
      width: frame.width,
      height: frame.height,
      backgroundColor: "transparent",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = fabricCanvas;

    return () => {
      fabricCanvas.dispose();
    };
  }, [frame.width, frame.height]);

  // Update canvas size when frame resizes
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setDimensions({
        width: frame.width,
        height: frame.height,
      });
      fabricCanvasRef.current.requestRenderAll();
    }
  }, [frame.width, frame.height]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only allow dragging when select tool is active and clicking on the frame border/background
    if (!isSelectTool) return;

    // Check if clicking on the frame itself, not the canvas inside
    const target = e.target as HTMLElement;
    if (target.tagName === "CANVAS") return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - frame.x - pan.x,
      y: e.clientY - frame.y - pan.y,
    });
    onSelect(frame.id);
    e.stopPropagation();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragStart.x - pan.x;
      const newY = e.clientY - dragStart.y - pan.y;
      onMove(frame.id, newX, newY);
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart, zoom, pan, frame.id, onMove]);

  useEffect(() => {
    if (!isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") {
        onDelete(frame.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSelected, frame.id, onDelete]);

  return (
    <div
      ref={frameRef}
      className='absolute border-2 border-blue-500 bg-[#171717]'
      style={{
        left: frame.x + pan.x,
        top: frame.y + pan.y,
        width: frame.width,
        height: frame.height,
        outline: isSelected ? "2px solid #60a5fa" : "none",
        outlineOffset: "2px",
        pointerEvents: "auto",
        cursor: isSelectTool ? "move" : "default",
        transformOrigin: "0 0",
      }}
      onMouseDown={handleMouseDown}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          pointerEvents: "auto",
        }}
      />
      {isSelected && (
        <div className='absolute -top-6 left-0 bg-blue-500 text-white text-xs px-2 py-0.5 rounded pointer-events-none'>
          Frame
        </div>
      )}
    </div>
  );
}

export function getFrameCanvas(
  frameElement: HTMLDivElement
): FabricCanvas | null {
  const canvas = frameElement.querySelector("canvas");
  if (!canvas) return null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (canvas as any).__fabric || null;
}
