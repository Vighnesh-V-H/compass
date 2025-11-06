"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Canvas as FabricCanvas,
  Circle,
  Rect,
  Triangle,
  Line,
  PencilBrush,
  Point,
  Textbox,
  TEvent,
  TPointerEvent,
  FabricObject,
  FabricObjectProps,
} from "fabric";
import CanvasToolbar from "./tools";
import { useCanvasStore } from "@/store/canvas-store";
import { ChatForm, ChatFormRef } from "./chat";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

function isNested(inner: FabricObject, outer: FabricObject): boolean {
  const innerRect = inner.getBoundingRect();
  const outerRect = outer.getBoundingRect();

  return (
    innerRect.left >= outerRect.left &&
    innerRect.top >= outerRect.top &&
    innerRect.left + innerRect.width <= outerRect.left + outerRect.width &&
    innerRect.top + innerRect.height <= outerRect.top + outerRect.height
  );
}

function isIntersecting(a: FabricObject, b: FabricObject): boolean {
  const r1 = a.getBoundingRect();
  const r2 = b.getBoundingRect();

  return !(
    r2.left > r1.left + r1.width ||
    r2.left + r2.width < r1.left ||
    r2.top > r1.top + r1.height ||
    r2.top + r2.height < r1.top
  );
}

interface CanvasProps {
  projectId: string;
}

function Canvas({ projectId }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const textboxRef = useRef<Textbox | null>(null);
  const isCreatingShapeRef = useRef<boolean>(false);
  const chatFormRef = useRef<ChatFormRef>(null);

  const [isReady, setIsReady] = useState(false);

  const {
    selectedTool,
    zoom,
    pan,
    setPan,
    setIsDrawing,
    addToHistory,
    setSelectedTool,
    setZoom,
    shouldRestore,
    getCurrentHistoryState,
    clearRestoreFlag,
    undo,
    redo,
    loadFromStorage,
    setProjectId,
  } = useCanvasStore();

  const saveCanvasState = useCallback(
    (canvas: FabricCanvas) => {
      const canvasJSON = JSON.stringify(canvas.toJSON());
      addToHistory({ canvasJSON });
    },
    [addToHistory]
  );

  const handleGenerateImage = useCallback(() => {
    if (!fabricCanvasRef.current || !chatFormRef.current) return;

    const canvas = fabricCanvasRef.current;

    const dataURL = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 2,
    });

    chatFormRef.current.addImage(dataURL);

    chatFormRef.current.focusInput();
  }, []);

  useEffect(() => {
    loadFromStorage();
    if (projectId) {
      setProjectId(projectId);
    }
  }, [loadFromStorage, projectId, setProjectId]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      width: window.innerWidth,
      height: window.innerHeight - 80,
      backgroundColor: "#000",
      selection: true,
      preserveObjectStacking: true,
    });

    fabricCanvasRef.current = canvas;
    setIsReady(true);

    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight - 80,
      });
      canvas.requestRenderAll();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.dispose();
    };
  }, []);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;
    const center = canvas.getCenterPoint();
    canvas.zoomToPoint(center, zoom);
    canvas.requestRenderAll();
  }, [zoom, isReady]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;
    if (canvas.viewportTransform) {
      canvas.viewportTransform[4] = pan.x;
      canvas.viewportTransform[5] = pan.y;
      canvas.requestRenderAll();
    }
  }, [pan, isReady]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady || !shouldRestore) return;

    const canvas = fabricCanvasRef.current;
    const historyState = getCurrentHistoryState();

    if (!historyState || !historyState.canvasJSON) {
      clearRestoreFlag();
      return;
    }

    setIsDrawing(true);
    isCreatingShapeRef.current = true;

    try {
      const canvasData = JSON.parse(historyState.canvasJSON);
      canvas.loadFromJSON(canvasData, () => {
        canvas.backgroundColor = "#000";
        canvas.requestRenderAll();

        setTimeout(() => {
          setIsDrawing(false);
          isCreatingShapeRef.current = false;
          clearRestoreFlag();
        }, 50);
      });
    } catch (error) {
      console.error("Error restoring canvas:", error);
      setIsDrawing(false);
      isCreatingShapeRef.current = false;
      clearRestoreFlag();
    }
  }, [
    shouldRestore,
    isReady,
    getCurrentHistoryState,
    clearRestoreFlag,
    setIsDrawing,
  ]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;

    const handleWheel = (opt: TEvent<WheelEvent>) => {
      if (!opt.e.ctrlKey) return;

      const delta = opt.e.deltaY;
      let z = canvas.getZoom();
      z = z / (1 + delta / 500);
      if (z > 20) z = 20;
      if (z < 0.01) z = 0.01;
      canvas.zoomToPoint(new Point(opt.e.offsetX, opt.e.offsetY), z);
      setZoom(z);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    };

    canvas.on("mouse:wheel", handleWheel);

    return () => {
      canvas.off("mouse:wheel", handleWheel);
    };
  }, [isReady, setZoom]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;
    // const shapeTools = ["rectangle", "circle", "triangle", "frame"];

    canvas.isDrawingMode = false;
    canvas.selection = selectedTool === "select" || selectedTool === null;
    canvas.defaultCursor = "default";
    canvas.hoverCursor = "move";

    let mouseDownHandler: ((o: TEvent<TPointerEvent>) => void) | undefined;
    // @ts-expect-error errors
    let mouseMoveHandler: ((o) => void) | undefined;
    let mouseUpHandler: (() => void) | undefined;

    switch (selectedTool) {
      case "select":
        canvas.defaultCursor = "default";
        canvas.selection = true;
        break;

      case "draw":
        canvas.isDrawingMode = true;
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.color = "#fff";
        canvas.freeDrawingBrush.width = 2;
        break;

      case "eraser":
        canvas.isDrawingMode = false;
        canvas.defaultCursor = "crosshair";
        canvas.selection = false;

        let isErasing = false;

        let eraserPath = [];

        mouseDownHandler = (o) => {
          if (o.e.shiftKey) return;
          isErasing = true;
          const pointer = canvas.getScenePoint(o.e);
          eraserPath = [pointer];
          setIsDrawing(true);
        };

        mouseMoveHandler = (o) => {
          if (!isErasing) return;

          const pointer = canvas.getScenePoint(o.e);
          eraserPath.push(pointer);

          const eraserSize = 20;
          const objects = canvas.getObjects();

          objects.forEach((obj) => {
            const objBounds = obj.getBoundingRect();

            if (
              pointer.x >= objBounds.left - eraserSize &&
              pointer.x <= objBounds.left + objBounds.width + eraserSize &&
              pointer.y >= objBounds.top - eraserSize &&
              pointer.y <= objBounds.top + objBounds.height + eraserSize &&
              !obj.lockRotation
            ) {
              canvas.remove(obj);
            }
          });

          canvas.requestRenderAll();
        };

        mouseUpHandler = () => {
          if (isErasing) {
            saveCanvasState(canvas);
          }

          setIsDrawing(false);
          isErasing = false;
          eraserPath = [];
        };

        canvas.on("mouse:down", mouseDownHandler);
        canvas.on("mouse:move", mouseMoveHandler);
        canvas.on("mouse:up", mouseUpHandler);
        break;

      case "hand":
        canvas.defaultCursor = "grab";
        canvas.selection = false;
        break;

      case "text":
        canvas.defaultCursor = "text";
        canvas.selection = false;

        mouseDownHandler = (o) => {
          if (o.e.shiftKey) return;
          const pointer = canvas.getScenePoint(o.e);

          const textbox = new Textbox("", {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: "#fff",
            backgroundColor: "#000",
          });

          textboxRef.current = textbox;

          canvas.add(textbox);
          canvas.setActiveObject(textbox);
          textbox.enterEditing();

          textbox.on("editing:exited", () => {
            if (!textbox.text || textbox.text.trim() === "") {
              canvas.remove(textbox);
              canvas.requestRenderAll();
              textboxRef.current = null;
            } else {
              saveCanvasState(canvas);
            }
          });

          setIsDrawing(true);
        };

        mouseUpHandler = () => {
          setIsDrawing(false);
          setSelectedTool("select");
        };

        canvas.on("mouse:down", mouseDownHandler);
        canvas.on("mouse:up", mouseUpHandler);
        break;

      case "line":
        canvas.defaultCursor = "crosshair";
        canvas.selection = false;

        let isDrawingLine = false;
        let line: Line;
        let lineStartX = 0;
        let lineStartY = 0;

        mouseDownHandler = (o) => {
          if (o.e.shiftKey) return;
          isCreatingShapeRef.current = true;
          isDrawingLine = true;
          const pointer = canvas.getScenePoint(o.e);
          lineStartX = pointer.x;
          lineStartY = pointer.y;

          line = new Line([lineStartX, lineStartY, lineStartX, lineStartY], {
            stroke: "#3b82f6",
            strokeWidth: 2,
            selectable: true,
            evented: true,
          });

          canvas.add(line);
          setIsDrawing(true);
        };

        mouseMoveHandler = (o) => {
          if (!isDrawingLine || !line) return;

          const pointer = canvas.getScenePoint(o.e);
          line.set({
            x2: pointer.x,
            y2: pointer.y,
          });

          line.setCoords();
          canvas.requestRenderAll();
        };

        mouseUpHandler = () => {
          if (isDrawingLine && line) {
            saveCanvasState(canvas);
          }
          setIsDrawing(false);
          setSelectedTool("select");
          isDrawingLine = false;
          isCreatingShapeRef.current = false;
        };

        canvas.on("mouse:down", mouseDownHandler);
        canvas.on("mouse:move", mouseMoveHandler);
        canvas.on("mouse:up", mouseUpHandler);
        break;

      case "rectangle":
      case "circle":
      case "triangle":
      case "frame":
        canvas.defaultCursor = "crosshair";
        canvas.selection = false;

        let isDown = false;
        let shape: FabricObject<FabricObjectProps>;
        let startX = 0;
        let startY = 0;

        mouseDownHandler = (o) => {
          if (o.e.shiftKey) return;
          isCreatingShapeRef.current = true;
          isDown = true;
          const pointer = canvas.getScenePoint(o.e);
          startX = pointer.x;
          startY = pointer.y;

          const commonProps = {
            fill:
              selectedTool === "frame"
                ? "transparent"
                : "rgba(59, 130, 246, 0.3)",
            stroke: "#3b82f6",
            strokeWidth: 2,
          };

          if (selectedTool === "rectangle") {
            shape = new Rect({
              ...commonProps,
              left: startX,
              top: startY,
              width: 0,
              height: 0,
              fill: "transparent",
            });
          } else if (selectedTool === "frame") {
            shape = new Rect({
              ...commonProps,
              left: startX,
              top: startY,
              fill: "transparent",
              width: 0,
              height: 0,
              stroke: "#fff000",
              backgroundColor: "#0f0f0f",
              strokeWidth: 1,
              evented: false,
              lockMovementX: true,
              lockMovementY: true,
              lockSkewingX: true,

              lockRotation: true,
            });
          } else if (selectedTool === "circle") {
            shape = new Circle({
              ...commonProps,
              left: startX,
              top: startY,
              radius: 0,
            });
          } else if (selectedTool === "triangle") {
            shape = new Triangle({
              ...commonProps,
              left: startX,
              top: startY,
              width: 0,
              height: 0,
            });
          }

          if (shape) {
            canvas.add(shape);
            shape.setCoords();
            setIsDrawing(true);
          }
        };

        mouseMoveHandler = (o) => {
          if (!isDown || !shape) return;

          const pointer = canvas.getScenePoint(o.e);
          const dx = pointer.x - startX;
          const dy = pointer.y - startY;

          if (
            selectedTool === "rectangle" ||
            selectedTool === "frame" ||
            selectedTool === "triangle"
          ) {
            shape.set({
              width: Math.abs(dx),
              height: Math.abs(dy),
              left: Math.min(startX, pointer.x),
              top: Math.min(startY, pointer.y),
            });
          } else if (selectedTool === "circle") {
            const radius = Math.sqrt(dx * dx + dy * dy) / 2;
            shape.set({
              left: startX + dx / 2 - radius,
              top: startY + dy / 2 - radius,
              radius: Math.abs(radius),
            });
          }

          shape.setCoords();
          canvas.requestRenderAll();
        };

        mouseUpHandler = () => {
          if (isDown && shape) {
            saveCanvasState(canvas);
          }
          const tb = textboxRef.current;
          if (tb && !tb.isEditing && (!tb.text || tb.text.trim() === "")) {
            tb.visible = false;
            canvas.remove(tb);
            canvas.requestRenderAll();
            textboxRef.current = null;
          }

          setIsDrawing(false);
          setSelectedTool("select");
          isDown = false;
          isCreatingShapeRef.current = false; // Clear flag when done creating shape
          // shape;
        };

        canvas.on("mouse:down", mouseDownHandler);
        canvas.on("mouse:move", mouseMoveHandler);
        canvas.on("mouse:up", mouseUpHandler);
        canvas.on("object:added", (e) => {
          const target = e.target as FabricObject;
          if (!target) return;
          // canvas.setActiveObject(e.target);

          const parentToUnlock: FabricObject[] = [];

          canvas.getObjects().forEach((obj) => {
            if (obj === target) return;

            if (isNested(target, obj) || isIntersecting(target, obj)) {
              obj.lockMovementX = true;
              obj.lockMovementY = true;
              parentToUnlock.push(obj);
            }
          });

          requestAnimationFrame(() => {
            parentToUnlock.forEach((obj) => {
              obj.lockMovementX = false;
              obj.lockMovementY = false;
            });

            target.lockMovementX = false;
            target.lockMovementY = false;

            parentToUnlock.forEach((obj) => (obj.selectable = true));
            target.selectable = true;
          });
        });

        canvas.on("object:modified", (e) => {
          console.log(e);
        });

        canvas.on("selection:created", (e) => {
          const selected = e.selected ?? [];

          for (let i = 0; i < selected.length; i++) {
            for (let j = 0; j < selected.length; j++) {
              if (i !== j && isNested(selected[i], selected[j])) {
                console.log(
                  `${selected[i].type} is nested inside ${selected[j].type}`
                );
              }
            }
          }
        });
        break;
    }

    canvas.requestRenderAll();

    return () => {
      if (mouseDownHandler) canvas.off("mouse:down", mouseDownHandler);
      if (mouseMoveHandler) canvas.off("mouse:move", mouseMoveHandler);
      if (mouseUpHandler) canvas.off("mouse:up", mouseUpHandler);
    };
  }, [selectedTool, isReady, setIsDrawing, setSelectedTool, saveCanvasState]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;
    let isPanning = false;
    let lastPosX = 0;
    let lastPosY = 0;

    // @ts-expect-error errors
    const startPan = (o) => {
      const isHandTool = selectedTool === "hand";
      const isMiddle = o.e.button === 1;
      const isShiftLeft = o.e.button === 0 && o.e.shiftKey;
      if (isHandTool || isMiddle || isShiftLeft) {
        isPanning = true;
        lastPosX = o.e.clientX;
        lastPosY = o.e.clientY;
        canvas.defaultCursor = "grabbing";
        canvas.selection = false;
      }
    };
    // @ts-expect-error errors
    const handlePan = (o) => {
      if (isPanning) {
        const deltaX = o.e.clientX - lastPosX;
        const deltaY = o.e.clientY - lastPosY;
        const currentZoom = canvas.getZoom();

        setPan({
          x: pan.x + deltaX / currentZoom,
          y: pan.y + deltaY / currentZoom,
        });

        lastPosX = o.e.clientX;
        lastPosY = o.e.clientY;
      }
    };

    const endPan = () => {
      if (isPanning) {
        isPanning = false;
        const shapeTools = ["rectangle", "circle", "triangle", "line", "frame"];
        const isShapeTool = shapeTools.includes(selectedTool || "");
        canvas.defaultCursor =
          selectedTool === "hand"
            ? "grab"
            : isShapeTool
              ? "crosshair"
              : "default";
        canvas.selection =
          selectedTool === "select" ||
          selectedTool === null ||
          selectedTool === "text";
      }
    };

    canvas.on("mouse:down", startPan);
    canvas.on("mouse:move", handlePan);
    canvas.on("mouse:up", endPan);
    canvas.on("mouse:out", endPan);

    return () => {
      canvas.off("mouse:down", startPan);
      canvas.off("mouse:move", handlePan);
      canvas.off("mouse:up", endPan);
      canvas.off("mouse:out", endPan);
    };
  }, [isReady, setPan, selectedTool, pan]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;

    const saveState = () => {
      const currentIsDrawing = useCanvasStore.getState().isDrawing;
      if (currentIsDrawing || isCreatingShapeRef.current) return;
      saveCanvasState(canvas);
    };

    canvas.on("object:added", saveState);
    canvas.on("object:modified", saveState);
    canvas.on("object:removed", saveState);

    return () => {
      canvas.off("object:added", saveState);
      canvas.off("object:modified", saveState);
      canvas.off("object:removed", saveState);
    };
  }, [isReady, saveCanvasState]);

  useEffect(() => {
    if (!fabricCanvasRef.current || !isReady) return;

    const canvas = fabricCanvasRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeObject = canvas.getActiveObject();
      if (
        activeObject &&
        activeObject.type === "textbox" &&
        (activeObject as Textbox).isEditing
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          activeObjects.forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.requestRenderAll();
          saveCanvasState(canvas);
        }
        return;
      }

      switch (e.key.toLowerCase()) {
        case "v":
          setSelectedTool("select");
          break;
        case "r":
          setSelectedTool("rectangle");
          break;
        case "c":
          setSelectedTool("circle");
          break;
        case "t":
          setSelectedTool("triangle");
          break;
        case "l":
          setSelectedTool("line");
          break;
        case "p":
        case "b":
          setSelectedTool("draw");
          break;
        case "e":
          setSelectedTool("eraser");
          break;
        case "f":
          setSelectedTool("frame");
          break;
        case "x":
          setSelectedTool("text");
          break;
        case "h":
          setSelectedTool("hand");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isReady, setSelectedTool, undo, redo, saveCanvasState]);

  return (
    <div className='w-full overflow-hidden relative'>
      <Button
        onClick={handleGenerateImage}
        className='absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2'
        variant='default'>
        <Download className='w-4 h-4' />
        Generate
      </Button>
      <canvas ref={canvasRef} />
      <ChatForm ref={chatFormRef} />
      <CanvasToolbar />
    </div>
  );
}

export default Canvas;
