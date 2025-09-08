import { Hono } from "hono";
import { auth } from "@/lib/auth";

const router = new Hono();

router.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

export default router;
