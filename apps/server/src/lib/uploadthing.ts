import { Hono } from "hono";
import { auth } from "@/lib/auth";
import {
  createUploadthing,
  UploadThingError,
  type FileRouter,
} from "uploadthing/server";
import { db } from "@/db";
import { moodboard } from "@/db/schema";
import { z } from "zod";

const f = createUploadthing();

export const uploadRouter = {
  imageUploader: f({
    image: { maxFileSize: "8MB", maxFileCount: 10 },
  })
    .input(z.object({ projectId: z.string() }))
    .middleware(async ({ req, input }) => {
      const session = await auth.api.getSession({
        headers: req.headers as any,
      });

      if (!session?.user) {
        throw new Error("Unauthorized");
      }

      return {
        userId: session?.user.id,
        projectId: input.projectId,
      };
    })
    .onUploadError(async (e) => {
   
      console.log(e.error);
    })
    .onUploadComplete(async ({ metadata, file }) => {

   
      const { projectId, userId } = metadata;


      try {
        if (!userId) {
          return;
        }
        await db.insert(moodboard).values({
          projectId,
          url: file.ufsUrl,
          name: file.name,
          key: file.key,
          userId,
        });

        return { url: file.ufsUrl, name: file.name, key: file.key };
      } catch (error) {
        console.error(`Failed to save image ${file.name}:`, error);
        throw new Error("Failed to save image to database");
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;
