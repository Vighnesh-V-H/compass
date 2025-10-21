import { Hono } from "hono";
import { auth } from "@/lib/auth";

const router = new Hono();

router.on(["POST", "GET"], "/auth/*", (c) => {
  return auth.handler(c.req.raw);
});

router.post("/auth/sign-in/email", async (ctx) => {
  const { email, password } = await ctx.req.json();

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
      rememberMe: true,
      callbackURL: "http://localhost:3000/dashboard",
    },
    headers: ctx.header,
  });

  console.log(data.token);

  ctx.json(data);
});

export default router;
