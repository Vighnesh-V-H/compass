import createDb from "./config";

const { db } = createDb({
  url: process.env.DATABASE_URL!,
  maxConnections: process.env.DB_MAX_CONN
    ? parseInt(process.env.DB_MAX_CONN)
    : 20,
  idleTimeout: 60000,
  ssl: true,
});

export { db };
