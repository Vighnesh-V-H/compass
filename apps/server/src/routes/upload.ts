import { Hono } from "hono";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "../lib/uploadthing";

const handlers = createRouteHandler({
  router: uploadRouter,
});

const app = new Hono();

app.all("/uploadthing", (context) => handlers(context.req.raw));

export default app;
