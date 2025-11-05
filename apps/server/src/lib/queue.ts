import { Queue, Worker, Job } from "bullmq";
import { redis } from "./redis";
import { db } from "@/db";
import { canvas } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

interface CanvasJobData {
  projectId: string;
  userId: string;
  canvasState: string;
  timestamp: number;
}

export const canvasQueue = new Queue<CanvasJobData>("canvas-queue", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 1000,
    },
    removeOnComplete: {
      count: 100,
      age: 3600,
    },
    removeOnFail: {
      count: 1000,
    },
  },
});

export const canvasWorker = new Worker<CanvasJobData>(
  "canvas-queue",
  async (job: Job<CanvasJobData>) => {
    const { projectId, userId, canvasState, timestamp } = job.data;

    try {
      logger.info(`Processing canvas save job for project: ${projectId}`);

      const existingCanvas = await db
        .select()
        .from(canvas)
        .where(eq(canvas.projectId, projectId))
        .limit(1);

      if (existingCanvas.length > 0) {
        await db
          .update(canvas)
          .set({
            canvasState,
            updatedAt: new Date(timestamp),
          })
          .where(eq(canvas.projectId, projectId));

        logger.info(`Canvas updated for project: ${projectId}`);
      } else {
        await db.insert(canvas).values({
          projectId,
          userId,
          canvasState,
          createdAt: new Date(timestamp),
          updatedAt: new Date(timestamp),
        });

        logger.info(`Canvas created for project: ${projectId}`);
      }

      return { success: true, projectId };
    } catch (error) {
      logger.error(`Error persisting canvas for project ${projectId}:`, error);
      throw error;
    }
  },
  {
    connection: redis,
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 1000,
    },
  }
);

// Worker event listeners
canvasWorker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed for project: ${job.data.projectId}`);
});

canvasWorker.on("failed", (job, err) => {
  logger.error(
    `Job ${job?.id} failed for project: ${job?.data.projectId}`,
    err
  );
});

canvasWorker.on("error", (err) => {
  logger.error("Canvas worker error:", err);
});

process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing canvas worker...");
  await canvasWorker.close();
  await canvasQueue.close();
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing canvas worker...");
  await canvasWorker.close();
  await canvasQueue.close();
});

export const addCanvasSaveJob = async (data: CanvasJobData) => {
  await canvasQueue.add("persist-canvas", data, {
    jobId: `canvas-${data.projectId}-${data.timestamp}`, // Unique job ID to prevent duplicates
    delay: 1000, // Wait 1 second before processing (allows for debouncing)
  });
};
