// Server-side InstantDB instance
// Note: For production with custom email sending, consider using @instantdb/admin
// which has better support for generateMagicCode
// Install with: pnpm add @instantdb/admin
// Then use db.auth.generateMagicCode({ email }) instead, which doesn't send an email.
import { init } from "@instantdb/react";
import schema from "../instant.schema";

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID;

if (!appId) {
  throw new Error("NEXT_PUBLIC_INSTANT_APP_ID is not set");
}

const db = init({
  appId,
  schema,
});

export default db;
