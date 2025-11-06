import { Hono } from "hono";
import authRouter from "@/routes/auth";
import projectRouter from "@/routes/projects";
import canvasRouter from "@/routes/canvas";
import uploadRouter from "@/routes/upload";
import moodboardRouter from "@/routes/moodboard";
import aiRouter from "@/routes/ai";
import { cors } from "hono/cors";
import Bun from "bun";

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
app.basePath("/api").route("/", canvasRouter);
app.basePath("/api").route("/", aiRouter);

Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8081,
});

console.log(`Server running on http://localhost:${process.env.PORT}`);
