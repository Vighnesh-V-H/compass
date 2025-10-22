import { Hono } from "hono";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";
import { createProjectSchema } from "@compass/schemas";
import { ZodError } from "zod";
import { redis } from "@/lib/redis";

const router = new Hono();

router.post("/projects", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(Object.entries(c.req.header())),
    });

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const validatedData = createProjectSchema.parse(body);

    const newProject = await db
      .insert(project)
      .values({
        userId: session.user.id,
        name: validatedData.name,
        visibility: validatedData.visibility,
      })
      .returning();

    const cacheKey = `projects:${session.user.id}`;
    await redis.del(cacheKey);

    return c.json(
      {
        message: "Project created successfully",
        project: newProject[0],
      },
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return c.json(
        { error: "Validation failed", details: error.message },
        400
      );
    }
    console.error("Error while creating the project:", error);
    return c.json({ error: "Failed to create project" }, 500);
  }
});

router.get("/projects", async (c) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(Object.entries(c.req.header())),
    });

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cacheKey = `projects:${session.user.id}`;
    const cachedProjects = await redis.get(cacheKey);

    if (cachedProjects) {
      return c.json({ projects: JSON.parse(cachedProjects) }, 200);
    }

    const projects = await db
      .select()
      .from(project)
      .where(eq(project.userId, session.user.id));

    await redis.set(cacheKey, JSON.stringify(projects), "EX", 3600);

    return c.json({ projects }, 200);
  } catch (error) {
    console.error("Error while fetching projects:", error);
    return c.json({ error: "Failed to fetch projects" }, 500);
  }
});

export default router;
