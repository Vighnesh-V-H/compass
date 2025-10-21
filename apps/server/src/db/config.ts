import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";
import * as schema from "./schema";

interface DbConfig {
  url: string;
  maxConnections?: number;
  idleTimeout?: number;
  ssl?: boolean | object;
  onQuery?: (query: string, params: unknown[]) => void;
}

const createDrizzle = (conn: Sql) => drizzle(conn, { schema });

const createDb = (config: DbConfig) => {
  const {
    url,
    maxConnections = 10,
    idleTimeout = 30000,
    ssl = process.env.NODE_ENV === "production",
    onQuery,
  } = config;

  const postgresOptions = {
    max: maxConnections,
    idle_timeout: idleTimeout,
    ...(ssl && {
      ssl: typeof ssl === "object" ? ssl : { rejectUnauthorized: false },
    }),
  };

  const conn = postgres(url, postgresOptions);
  const db = createDrizzle(conn);

  return { db, conn };
};

export type DB = ReturnType<typeof createDrizzle>;

export default createDb;
