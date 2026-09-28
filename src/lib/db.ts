import { Pool, QueryResultRow } from "pg";

declare global {
  var __dukasmartPool: Pool | undefined;
}
export const pool =
  global.__dukasmartPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: process.env.NODE_ENV === "production" ? 1 : 10,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  global.__dukasmartPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
) {
  const result = await pool.query<T>(text, params);
  return result;
}
