import { Hono } from "hono";

import { db } from "@/db";
import { moodboard, project } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthEnv } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth";
import { addCanvasSaveJob } from "@/lib/queue";

const router = new Hono<AuthEnv>();

router.get("/canvas/:projectId", authMiddleware, async (c) => {
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

    return c.json({ images: "" }, 200);
  } catch (error) {
    console.error("Error while fetching moodboard images:", error);
    return c.json({ error: "Failed to fetch moodboard images" }, 500);
  }
});

router.post("/canvas/:projectId", authMiddleware, async (c) => {
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
    const { canvasState } = body;
    console.log(canvasState);

    if (!canvasState) {
      return c.json({ error: "Canvas state is required" }, 400);
    }

    await addCanvasSaveJob({
      projectId,
      userId: user.id,
      canvasState,
      timestamp: Date.now(),
    });

    return c.json({ success: true }, 200);
  } catch (error) {
    console.error("Error while saving canvas:", error);
    return c.json({ error: "Failed to save canvas" }, 500);
  }
});

export default router;