// Server-side InstantDB instance using @instantdb/admin
// This provides access to generateMagicCode for custom email sending
import { init } from "@instantdb/admin";
import schema from "../instant.schema";

let dbInstance: ReturnType<typeof init> | null = null;

function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID?.trim();
  const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN?.trim();

  if (!appId) {
    throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not set");
  }

  if (!adminToken) {
    throw new Error(
      "INSTANT_APP_ADMIN_TOKEN is not set. Get your admin token from https://instantdb.com/dash\n" +
      "The admin token is required for server-side operations like generateMagicCode."
    );
  }

  dbInstance = init({
    appId,
    adminToken,
    schema,
  });

  return dbInstance;
}

// Lazy initialization: only initialize when actually accessed
// This prevents build-time errors when env vars aren't available
// During build, Next.js analyzes the module but doesn't execute the function
const db = new Proxy({} as ReturnType<typeof init>, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as any)[prop];
    if (typeof value === 'function') {
      return value.bind(instance);
    }
    return value;
  }
});

export default db;
