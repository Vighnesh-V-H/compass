import { createMiddleware } from "hono/factory";
import { auth } from "@/lib/auth";
import type { AuthEnv } from "@/lib/types";

export const authMiddleware = createMiddleware<AuthEnv>(async (c, next) => {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(Object.entries(c.req.header())),
    });

    if (!session?.user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    c.set("user", session.user);
    c.set("session", session.session);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return c.json({ error: "Authentication failed" }, 500);
  }
});
