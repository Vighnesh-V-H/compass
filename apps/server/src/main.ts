import { Hono } from "hono";
import authRouter from "@/routes/auth";
import projectRouter from "@/routes/projects";
import { cors } from "hono/cors";
import Bun from "bun";

const app = new Hono();

app.use(
  "/api/*",
  cors({
    origin: "http://localhost:3000",
    allowMethods: ["GET", "POST", "OPTIONS", "DELETE"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.basePath("/api").route("/", authRouter);
app.basePath("/api").route("/", projectRouter);

Bun.serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 8081,
});

console.log(`Server running on http://localhost:${process.env.PORT}`);
