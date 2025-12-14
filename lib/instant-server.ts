// Server-side InstantDB instance using @instantdb/admin
// This provides access to generateMagicCode for custom email sending
import { init } from "@instantdb/admin";
import schema from "../instant.schema";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;
const adminToken = process.env.INSTANT_APP_ADMIN_TOKEN;

if (!appId) {
  throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not set");
}

if (!adminToken) {
  throw new Error(
    "INSTANT_APP_ADMIN_TOKEN is not set. Get your admin token from https://instantdb.com/dash\n" +
    "The admin token is required for server-side operations like generateMagicCode."
  );
}

const db = init({
  appId,
  adminToken,
  schema,
});

export default db;
