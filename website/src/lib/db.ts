import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _authPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var _charPool: mysql.Pool | undefined;
  // eslint-disable-next-line no-var
  var _worldPool: mysql.Pool | undefined;
}

function makePool(database: string) {
  return mysql.createPool({
    host: process.env.AUTH_DB_HOST ?? "127.0.0.1",
    port: Number(process.env.AUTH_DB_PORT ?? 3306),
    user: process.env.AUTH_DB_USER,
    password: process.env.AUTH_DB_PASSWORD,
    database,
    waitForConnections: true,
    connectionLimit: 5,
  });
}

export const authDb = global._authPool ?? makePool(process.env.AUTH_DB_NAME ?? "acore_auth");
export const charDb = global._charPool ?? makePool(process.env.CHAR_DB_NAME ?? "acore_characters");
export const worldDb = global._worldPool ?? makePool(process.env.WORLD_DB_NAME ?? "acore_world");

if (process.env.NODE_ENV !== "production") {
  global._authPool = authDb;
  global._charPool = charDb;
  global._worldPool = worldDb;
}
