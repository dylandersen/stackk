import { init } from "@instantdb/react";
import schema from "../instant.schema";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID?.trim();

if (!appId) {
  throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not set");
}

const db = init({
  appId,
  schema,
});

// Note: Permissions (rules) should be configured via the InstantDB dashboard
// or API. The rules file (instant.perms.ts) is kept for reference.
// See: https://www.instantdb.com/docs/permissions

export default db;
