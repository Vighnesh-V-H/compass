import { Worker } from "bullmq";
import { db } from "@/db";
import { canvas } from "@/db/schema";
import { redis } from "@/lib/redis";
import Logger from "@/lib/logger";
import { eq, and } from "drizzle-orm";

interface CanvasJobData {
  projectId: string;
  userId: string;
  canvasState: string;
  timestamp: number;
}

const BATCH_SIZE = 10;
const BATCH_TIMEOUT = 5000;

class CanvasWorker {
  private worker: Worker;
  private batch: Map<string, CanvasJobData> = new Map();
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.worker = new Worker<CanvasJobData>(
      "canvas-queue",
      async (job) => {
        await this.handleJob(job.data);
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

    this.setupEventHandlers();
  }

  private async handleJob(data: CanvasJobData) {
    Logger.info(`Processing canvas job for project ${data.projectId}`);

    this.batch.set(data.projectId, data);

    if (this.batch.size >= BATCH_SIZE) {
      await this.flushBatch();
    } else {
      this.resetBatchTimer();
    }
  }

  private resetBatchTimer() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }

    this.batchTimer = setTimeout(async () => {
      if (this.batch.size > 0) {
        await this.flushBatch();
      }
    }, BATCH_TIMEOUT);
  }

  private async flushBatch() {
    if (this.batch.size === 0) return;

    const batchToProcess = new Map(this.batch);
    this.batch.clear();

    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }

    Logger.info(`Flushing batch of ${batchToProcess.size} canvas saves`);

    try {
      for (const [projectId, data] of batchToProcess) {
        await this.persistCanvas(data);
      }
      Logger.info(
        `Successfully persisted ${batchToProcess.size} canvas states`
      );
    } catch (error) {
      Logger.error("Error flushing batch:", error);
      throw error;
    }
  }

  private async persistCanvas(data: CanvasJobData) {
    try {
      const existing = await db
        .select()
        .from(canvas)
        .where(eq(canvas.projectId, data.projectId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(canvas)
          .set({
            canvasState: data.canvasState,
            updatedAt: new Date(),
          })
          .where(eq(canvas.projectId, data.projectId));

        Logger.debug(`Updated canvas for project ${data.projectId}`);
      } else {
        await db.insert(canvas).values({
          projectId: data.projectId,
          userId: data.userId,
          canvasState: data.canvasState,
        });

        Logger.debug(`Created canvas for project ${data.projectId}`);
      }
    } catch (error) {
      Logger.error(
        `Failed to persist canvas for project ${data.projectId}:`,
        error
      );
      throw error;
    }
  }

  private setupEventHandlers() {
    this.worker.on("completed", (job) => {
      Logger.info(`Job ${job.id} completed`);
    });

    this.worker.on("failed", (job, err) => {
      Logger.error(`Job ${job?.id} failed:`, err);
    });

    this.worker.on("error", (err) => {
      Logger.error("Worker error:", err);
    });

    this.worker.on("ready", () => {
      Logger.info("Canvas worker is ready");
    });
  }

  async shutdown() {
    Logger.info("Shutting down canvas worker...");

    if (this.batch.size > 0) {
      await this.flushBatch();
    }

    await this.worker.close();
    await redis.quit();

    Logger.info("Canvas worker shut down successfully");
  }
}

const worker = new CanvasWorker();

process.on("SIGTERM", async () => {
  await worker.shutdown();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.shutdown();
  process.exit(0);
});

Logger.info("Canvas worker started");
