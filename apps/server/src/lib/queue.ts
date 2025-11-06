import { Queue } from "bullmq";
import { redis } from "@/lib/redis";
import Logger from "@/lib/logger";
import { randomBytes } from "crypto";

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

export const addCanvasSaveJob = async (data: CanvasJobData) => {
  const jobId = `canvas-${data.projectId}-${data.timestamp}-${randomBytes(4).toString("hex")}`;
  Logger.info(`Adding canvas save job ${{ projectId: data.projectId, jobId }}`);
  await canvasQueue.add("persist-canvas", data, { jobId });
  Logger.debug(`Job queued: ${jobId}`);
};
