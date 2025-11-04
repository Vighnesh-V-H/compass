// "use client";

// import { useRef, useState, useEffect } from "react";
// import type { FrameProps } from "@/types/canvas";

// export function Frame({
//   id,
//   left,
//   top,
//   width,
//   height,
//   zoom = 1,
//   onResize,
//   onMove,
//   onDelete,
//   zIndex = 1,
// }: FrameProps) {
//   const frameRef = useRef<HTMLDivElement>(null);
//   const [isSelected, setIsSelected] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const [isResizing, setIsResizing] = useState(false);
//   const [resizeHandle, setResizeHandle] = useState<string>("");
//   const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
//   const [frameStart, setFrameStart] = useState({
//     left: 0,
//     top: 0,
//     width: 0,
//     height: 0,
//   });

//   const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
//     if ((e.target as HTMLElement).classList.contains("resize-handle")) {
//       return;
//     }

//     e.stopPropagation();
//     setIsSelected(true);
//     setIsDragging(true);
//     setDragStart({ x: e.clientX, y: e.clientY });
//     setFrameStart({ left, top, width, height });
//   };

//   const handleResizeStart = (
//     e: React.MouseEvent<HTMLDivElement>,
//     handle: string
//   ) => {
//     e.stopPropagation();
//     setIsSelected(true);
//     setIsResizing(true);
//     setResizeHandle(handle);
//     setDragStart({ x: e.clientX, y: e.clientY });
//     setFrameStart({ left, top, width, height });
//   };

//   useEffect(() => {
//     if (!isDragging && !isResizing) return;

//     const handleMouseMove = (e: MouseEvent) => {
//       const dx = (e.clientX - dragStart.x) / zoom;
//       const dy = (e.clientY - dragStart.y) / zoom;

//       if (isDragging) {
//         onMove?.(id, frameStart.left + dx, frameStart.top + dy);
//       } else if (isResizing) {
//         let newLeft = frameStart.left;
//         let newTop = frameStart.top;
//         let newWidth = frameStart.width;
//         let newHeight = frameStart.height;

//         if (resizeHandle.includes("e")) {
//           newWidth = Math.max(50, frameStart.width + dx);
//         }
//         if (resizeHandle.includes("w")) {
//           const widthDiff = Math.min(dx, frameStart.width - 50);
//           newWidth = frameStart.width - widthDiff;
//           newLeft = frameStart.left + widthDiff;
//         }
//         if (resizeHandle.includes("s")) {
//           newHeight = Math.max(50, frameStart.height + dy);
//         }
//         if (resizeHandle.includes("n")) {
//           const heightDiff = Math.min(dy, frameStart.height - 50);
//           newHeight = frameStart.height - heightDiff;
//           newTop = frameStart.top + heightDiff;
//         }

//         onResize?.(id, newWidth, newHeight);
//         onMove?.(id, newLeft, newTop);
//       }
//     };

//     const handleMouseUp = () => {
//       setIsDragging(false);
//       setIsResizing(false);
//       setResizeHandle("");
//     };

//     document.addEventListener("mousemove", handleMouseMove);
//     document.addEventListener("mouseup", handleMouseUp);

//     return () => {
//       document.removeEventListener("mousemove", handleMouseMove);
//       document.removeEventListener("mouseup", handleMouseUp);
//     };
//   }, [
//     isDragging,
//     isResizing,
//     dragStart,
//     frameStart,
//     zoom,
//     id,
//     onMove,
//     onResize,
//     resizeHandle,
//   ]);

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (frameRef.current && !frameRef.current.contains(e.target as Node)) {
//         setIsSelected(false);
//       }
//     };

//     const handleKeyDown = (e: KeyboardEvent) => {
//       if (isSelected && (e.key === "Delete" || e.key === "Backspace")) {
//         onDelete?.(id);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     document.addEventListener("keydown", handleKeyDown);

//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//       document.removeEventListener("keydown", handleKeyDown);
//     };
//   }, [isSelected, id, onDelete]);

//   return (
//     <div
//       ref={frameRef}
//       className={`absolute border-2 bg-[#0f0f0f]/50 cursor-move ${
//         isSelected ? "border-yellow-400" : "border-yellow-400"
//       }`}
//       style={{
//         left: `${left}px`,
//         top: `${top}px`,
//         width: `${Math.max(width, 1)}px`,
//         height: `${Math.max(height, 1)}px`,
//         zIndex,
//         pointerEvents: "auto",
//         minWidth: "1px",
//         minHeight: "1px",
//       }}
//       onMouseDown={handleMouseDown}>
//       {isSelected && (
//         <>
//           <div
//             className='resize-handle absolute -top-1 -left-1 w-3 h-3 bg-yellow-400 cursor-nw-resize'
//             onMouseDown={(e) => handleResizeStart(e, "nw")}
//           />
//           <div
//             className='resize-handle absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 cursor-ne-resize'
//             onMouseDown={(e) => handleResizeStart(e, "ne")}
//           />
//           <div
//             className='resize-handle absolute -bottom-1 -left-1 w-3 h-3 bg-yellow-400 cursor-sw-resize'
//             onMouseDown={(e) => handleResizeStart(e, "sw")}
//           />
//           <div
//             className='resize-handle absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 cursor-se-resize'
//             onMouseDown={(e) => handleResizeStart(e, "se")}
//           />

//           <div
//             className='resize-handle absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 cursor-n-resize'
//             onMouseDown={(e) => handleResizeStart(e, "n")}
//           />
//           <div
//             className='resize-handle absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-yellow-400 cursor-s-resize'
//             onMouseDown={(e) => handleResizeStart(e, "s")}
//           />
//           <div
//             className='resize-handle absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 cursor-w-resize'
//             onMouseDown={(e) => handleResizeStart(e, "w")}
//           />
//           <div
//             className='resize-handle absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-yellow-400 cursor-e-resize'
//             onMouseDown={(e) => handleResizeStart(e, "e")}
//           />
//         </>
//       )}
//     </div>
//   );
// }
