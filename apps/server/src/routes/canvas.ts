import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { moodboard, project } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { AuthEnv } from "@/lib/types";
import { authMiddleware } from "@/middleware/auth";

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

    //TODO implement canvas storage

    // const images = await db
    //   .select()
    //   .from(moodboard)
    //   .where(eq(moodboard.projectId, projectId));

    return c.json({ images: "" }, 200);
  } catch (error) {
    console.error("Error while fetching moodboard images:", error);
    return c.json({ error: "Failed to fetch moodboard images" }, 500);
  }
});

export default router;
