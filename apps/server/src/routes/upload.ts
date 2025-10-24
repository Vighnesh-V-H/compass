import { Hono } from "hono";
import { createRouteHandler } from "uploadthing/server";
import { uploadRouter } from "../lib/uploadthing";

const handlers = createRouteHandler({
  router: uploadRouter,
  config: {
    callbackUrl: process.env.CALLBACK_URL,
    isDev: true,
  },
});

const app = new Hono();

app.all("/uploadthing", (context) => handlers(context.req.raw));

export default app;