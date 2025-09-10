import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { createDb } from "@/db/index";
import * as schema from "@/db/schema";
import { SESSION_EXPIRY_TIME, SESSION_UPDATE_AGE } from "./constants";
const { db } = createDb(process.env.DATABASE_URL!);
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  trustedOrigins: ["http://localhost:3000"],
  socialProviders: {
    google: {
      prompt: "select_account consent",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  advanced: {
    ipAddress: { disableIpTracking: false },
  },
  session: {
    cookieName: "session",
    disableSessionRefresh: false,
    cookieCache: {
      enabled: true,
      maxAge: 1 * 60,
    },

    expiresIn: SESSION_EXPIRY_TIME,
    updateAge: SESSION_UPDATE_AGE,
  },
  plugins: [nextCookies()],
  logger: {
    level: "debug",
  },
});
