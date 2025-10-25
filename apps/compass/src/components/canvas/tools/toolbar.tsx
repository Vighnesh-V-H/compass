"use client";

import {
  MousePointer2,
  Square,
  Circle,
  Triangle,
  Pencil,
  Eraser,
  FrameIcon,
  Hand,
  Text,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasStore, type ToolType } from "@/store/canvas-store";

const tools = [
  { id: "select" as ToolType, icon: MousePointer2, label: "Select" },
  { id: "rectangle" as ToolType, icon: Square, label: "Rectangle" },
  { id: "circle" as ToolType, icon: Circle, label: "Circle" },
  { id: "triangle" as ToolType, icon: Triangle, label: "Triangle" },
  { id: "draw" as ToolType, icon: Pencil, label: "Draw" },
  { id: "eraser" as ToolType, icon: Eraser, label: "Eraser" },
  { id: "frame" as ToolType, icon: FrameIcon, label: "Frame" },
  { id: "text" as ToolType, icon: Text, label: "Text" },
  { id: "hand" as ToolType, icon: Hand, label: "Hand" },
];

export function Toolbar() {
  const { selectedTool, setSelectedTool } = useCanvasStore();

  return (
    <div className='flex items-center gap-2'>
      {tools.map((tool) => {
        const Icon = tool.icon;
        return (
          <Button
            key={tool.id}
            variant={selectedTool === tool.id ? "default" : "outline"}
            size='sm'
            onClick={() => setSelectedTool(tool.id)}
            className='rounded-full px-3 py-1 h-8'
            title={tool.label}>
            <Icon className='w-4 h-4' />
          </Button>
        );
      })}
    </div>
  );
}
