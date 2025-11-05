import winston from "winston";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  let log = `${timestamp} [${level}]: ${message}`;

  if (stack) {
    log += `\n${stack}`;
  }

  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }

  return log;
});

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        errors({ stack: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),

    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],

  exceptionHandlers: [
    new winston.transports.File({ filename: "logs/exceptions.log" }),
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: "logs/rejections.log" }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        printf(({ level, message, timestamp }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      ),
    })
  );
}

export const loggers = {
  request: (method: string, url: string, statusCode: number) => {
    logger.info(`${method} ${url} - ${statusCode}`);
  },

  error: (message: string, error: Error | unknown, context?: object) => {
    logger.error(message, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ...context,
    });
  },

  canvas: {
    saved: (projectId: string, userId: string) => {
      logger.info(`Canvas saved`, { projectId, userId });
    },
    loaded: (projectId: string, source: string) => {
      logger.info(`Canvas loaded`, { projectId, source });
    },
    jobQueued: (projectId: string, jobId: string) => {
      logger.info(`Canvas save job queued`, { projectId, jobId });
    },
    jobCompleted: (projectId: string, jobId: string) => {
      logger.info(`Canvas save job completed`, { projectId, jobId });
    },
    jobFailed: (projectId: string, jobId: string, error: string) => {
      logger.error(`Canvas save job failed`, { projectId, jobId, error });
    },
  },
};

export default logger;
