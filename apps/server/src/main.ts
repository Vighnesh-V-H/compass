import { Hono } from "hono";
import authRouter from "@/routes/auth";
import projectRouter from "@/routes/projects";
import uploadRouter from "@/routes/upload";
import moodboardRouter from "@/routes/moodboard";
import canvasRouter from "@/routes/canvas";
import { cors } from "hono/cors";
import Bun from "bun";

try {
  await import("@/lib/queue");
  console.log("✅ BullMQ worker initialized");
} catch (error) {
  console.warn("⚠️  BullMQ not available. Install with: bun add bullmq");
  console.warn("Canvas sync will work but without background DB persistence");
}

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS", "DELETE", "PATCH"],
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "x-uploadthing-package",
      "x-uploadthing-version",
      "traceparent",
      "b3",
      "x-session-token",
      "Authorization",
    ],
    credentials: true,
  })
);

app.basePath("/api").route("/", authRouter);
app.basePath("/api").route("/", projectRouter);
app.basePath("/api").route("/", uploadRouter);
app.basePath("/api").route("/", moodboardRouter);
app.basePath("/api/canvas").route("/", canvasRouter);

Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8081,
});

console.log(`Server running on http://localhost:${process.env.PORT}`);
