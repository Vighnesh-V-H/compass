import { Hono } from "hono";
import { db } from "@/db";
import { moodboard, project } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { authMiddleware } from "@/middleware/auth";
import type { AuthEnv } from "@/lib/types";

const router = new Hono<AuthEnv>();
router.use("/*", authMiddleware);
const utapi = new UTApi();

router.get("/moodboard/:projectId", async (c) => {
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

    const images = await db
      .select()
      .from(moodboard)
      .where(eq(moodboard.projectId, projectId));

    return c.json({ images }, 200);
  } catch (error) {
    console.error("Error while fetching moodboard images:", error);
    return c.json({ error: "Failed to fetch moodboard images" }, 500);
  }
});

router.delete("/moodboard/:projectId/images/:key", async (c) => {
  try {
    const user = c.get("user");
    const { projectId, key: imageKey } = c.req.param();

    console.log(projectId, imageKey);

    if (!projectId || !imageKey) {
      return c.json({ error: "Project ID and Image key are required" }, 400);
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

    const imageToDelete = await db
      .select()
      .from(moodboard)
      .where(
        and(
          eq(moodboard.key, imageKey),
          eq(moodboard.projectId, projectId),
          eq(moodboard.userId, user.id)
        )
      )
      .limit(1);

    if (imageToDelete.length === 0 || !imageToDelete[0]) {
      return c.json({ error: "Image not found" }, 404);
    }

    try {
      await utapi.deleteFiles(imageKey);
    } catch (uploadThingError) {
      console.error("Failed to delete from UploadThing:", uploadThingError);
    }

    await db
      .delete(moodboard)
      .where(
        and(
          eq(moodboard.key, imageKey),
          eq(moodboard.projectId, projectId),
          eq(moodboard.userId, user.id)
        )
      );

    return c.json(
      { success: true, message: "Image deleted successfully" },
      200
    );
  } catch (error) {
    console.error("Error while deleting moodboard image:", error);
    return c.json({ error: "Failed to delete moodboard image" }, 500);
  }
});

export default router;
