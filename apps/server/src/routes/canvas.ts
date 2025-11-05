import { Hono } from "hono";
import { db } from "@/db";
import { canvas, project } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthEnv } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth";
import { redis } from "@/lib/redis";
import { logger } from "@/lib/logger";

const router = new Hono<AuthEnv>();

const REDIS_CACHE_TTL = 3600; // 1 hour

// Lazy load queue to make it optional
let addCanvasSaveJob:
  | ((data: {
      projectId: string;
      userId: string;
      canvasState: string;
      timestamp: number;
    }) => Promise<void>)
  | null = null;

// Try to load BullMQ queue
try {
  const queueModule = await import("@/lib/queue");
  addCanvasSaveJob = queueModule.addCanvasSaveJob;
} catch (error) {
  console.warn("BullMQ not available, will save directly to DB");
}

router.get("/:projectId", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("projectId");

    if (!projectId) {
      return c.json({ error: "Project ID is required" }, 400);
    }

    const existingProject = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (existingProject.length === 0 || !existingProject[0]) {
      return c.json({ error: "Project not found" }, 404);
    }

    if (existingProject[0].userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const cacheKey = `canvas:project:${projectId}`;
    const cachedState = await redis.get(cacheKey);

    if (cachedState) {
      logger.info(`Canvas cache hit for project: ${projectId}`);
      return c.json({
        success: true,
        canvasState: cachedState,
        source: "cache",
      });
    }

    logger.info(`Canvas cache miss for project: ${projectId}`);
    const canvasData = await db
      .select()
      .from(canvas)
      .where(eq(canvas.projectId, projectId))
      .limit(1);

    if (canvasData.length === 0 || !canvasData[0]) {
      return c.json({
        success: true,
        canvasState: null,
        source: "none",
      });
    }

    await redis.set(cacheKey, canvasData[0].canvasState, "EX", REDIS_CACHE_TTL);

    return c.json({
      success: true,
      canvasState: canvasData[0].canvasState,
      source: "database",
    });
  } catch (error) {
    logger.error("Error while fetching canvas:", error);
    return c.json({ error: "Failed to fetch canvas" }, 500);
  }
});

router.post("/:projectId", authMiddleware, async (c) => {
  try {
    const user = c.get("user");
    const projectId = c.req.param("projectId");

    if (!projectId) {
      return c.json({ error: "Project ID is required" }, 400);
    }

    const existingProject = await db
      .select()
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1);

    if (existingProject.length === 0 || !existingProject[0]) {
      return c.json({ error: "Project not found" }, 404);
    }

    if (existingProject[0].userId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const { canvasState, timestamp } = body;

    if (!canvasState) {
      return c.json({ error: "Canvas state is required" }, 400);
    }

    try {
      JSON.parse(canvasState);
    } catch {
      return c.json({ error: "Invalid canvas state JSON" }, 400);
    }

    const saveTimestamp = timestamp || Date.now();

    const cacheKey = `canvas:project:${projectId}`;
    await redis.set(cacheKey, canvasState, "EX", REDIS_CACHE_TTL);
    logger.info(`Canvas cached for project: ${projectId}`);

    // Queue async DB persistence if BullMQ is available
    if (addCanvasSaveJob) {
      await addCanvasSaveJob({
        projectId,
        userId: user.id,
        canvasState,
        timestamp: saveTimestamp,
      });
    } else {
      // Fallback: Save directly to DB if BullMQ not available
      const existingCanvas = await db
        .select()
        .from(canvas)
        .where(eq(canvas.projectId, projectId))
        .limit(1);

      if (existingCanvas.length > 0) {
        await db
          .update(canvas)
          .set({
            canvasState,
            updatedAt: new Date(saveTimestamp),
          })
          .where(eq(canvas.projectId, projectId));
      } else {
        await db.insert(canvas).values({
          projectId,
          userId: user.id,
          canvasState,
          createdAt: new Date(saveTimestamp),
          updatedAt: new Date(saveTimestamp),
        });
      }
    }

    return c.json({
      success: true,
      message: "Canvas state saved",
      timestamp: saveTimestamp,
    });
  } catch (error) {
    logger.error("Error while saving canvas:", error);
    return c.json({ error: "Failed to save canvas" }, 500);
  }
});

export default router;
