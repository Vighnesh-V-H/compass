import { canvasApi, type CanvasStateData } from "@/lib/canvas-api";

export async function testCanvasSync(projectId: string) {
  console.group("🧪 Testing Canvas Sync");

  try {
    console.log("1️⃣ Testing load...");
    const loadedData = await canvasApi.loadCanvas(projectId);
    console.log("✅ Load successful:", loadedData);

    console.log("2️⃣ Testing save...");
    const testData: CanvasStateData = {
      elements: [
        {
          type: "rect",
          left: 100,
          top: 100,
          width: 200,
          height: 100,
          fill: "blue",
        },
      ],
      zoom: 1,
      pan: { x: 0, y: 0 },
      timestamp: Date.now(),
    };

    const saveResult = await canvasApi.saveCanvas(projectId, testData);
    console.log("✅ Save successful:", saveResult);

    console.log("3️⃣ Waiting 2 seconds then reloading...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const reloadedData = await canvasApi.loadCanvas(projectId);
    console.log("✅ Reload successful:", reloadedData);

    if (JSON.stringify(reloadedData) === JSON.stringify(testData)) {
      console.log("✅ Data matches! Canvas sync is working correctly.");
    } else {
      console.warn("⚠️ Data mismatch. Check server logs.");
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }

  console.groupEnd();
}

export function inspectLocalStorage(projectId: string) {
  const key = `canvas-state-${projectId}`;
  const data = localStorage.getItem(key);

  if (data) {
    console.log("📦 LocalStorage data:", JSON.parse(data));
  } else {
    console.log("📦 No canvas data in localStorage");
  }
}

export function clearLocalCanvasData(projectId: string) {
  const key = `canvas-state-${projectId}`;
  localStorage.removeItem(key);
  console.log("🗑️ Cleared canvas data from localStorage");
}

if (typeof window !== "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testCanvasSync = testCanvasSync;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).inspectLocalStorage = inspectLocalStorage;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).clearLocalCanvasData = clearLocalCanvasData;
}
