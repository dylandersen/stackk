import type { InstantRules } from "@instantdb/react";

const rules = {
  services: {
    allow: {
      view: "auth.id == data.userId",
      create: "auth.id != null",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
  transactions: {
    allow: {
      view: "auth.id == data.userId",
      create: "auth.id != null",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
  notification_channels: {
    allow: {
      view: "auth.id == data.userId",
      create: "auth.id != null",
      update: "auth.id == data.userId",
      delete: "auth.id == data.userId",
    },
  },
} satisfies InstantRules;

export default rules;
