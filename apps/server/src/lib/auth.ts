import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import * as schema from "@/db/schema";
import { SESSION_EXPIRY_TIME, SESSION_UPDATE_AGE } from "./constants";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),

  trustedOrigins: ["http://localhost:3000"],
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    revokeSessionsOnPasswordReset: true,
  },
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
      maxAge: 10 * 60,
    },

    expiresIn: SESSION_EXPIRY_TIME,
    updateAge: SESSION_UPDATE_AGE,
  },
  plugins: [nextCookies()],
});
