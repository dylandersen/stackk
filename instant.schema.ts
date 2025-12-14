import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    services: i.entity({
      name: i.string(),
      category: i.string(),
      price: i.number(),
      currency: i.string(),
      billingCycle: i.string(), // 'monthly' | 'yearly'
      nextPayment: i.string(), // ISO date string
      color: i.string(),
      logo: i.string(),
      usageMetric: i.string().optional(),
      usageCurrent: i.number().optional(),
      usageLimit: i.number().optional(),
      usageUnit: i.string().optional(),
      status: i.string(), // 'active' | 'paused' | 'canceled'
      connected: i.boolean(),
      slug: i.string(), // URL-friendly identifier
      userId: i.string(), // User ID for multi-user support
    }),
    transactions: i.entity({
      date: i.string(), // ISO date string
      amount: i.number(),
      status: i.string(), // 'paid' | 'pending'
      userId: i.string(), // User ID
    }),
    notification_channels: i.entity({
      type: i.string(), // 'push' | 'email' | 'slack'
      name: i.string(),
      detail: i.string(),
      enabled: i.boolean(),
      userId: i.string(), // User ID
    }),
  },
  links: {
    serviceTransactions: {
      forward: { on: "services", has: "many", label: "transactions" },
      reverse: { on: "transactions", has: "one", label: "service" },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
