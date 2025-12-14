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
    profiles: i.entity({
      firstName: i.string(),
      lastName: i.string(),
      // Referral source tracking for analytics dashboard
      // Structured values: 'friend_family', 'x', 'instagram', 'youtube', 'tiktok', 'google', 'reddit', 'product_hunt', 'other'
      // Query example for dashboard: filter profiles by referralSource and count
      // Example: { profiles: { $: { where: { referralSource: 'x' } } } }
      referralSource: i.string(),
      userId: i.string(), // User ID for linking to $users
    }),
  },
  links: {
    serviceTransactions: {
      forward: { on: "services", has: "many", label: "transactions" },
      reverse: { on: "transactions", has: "one", label: "service" },
    },
    profileUser: {
      forward: { on: "profiles", has: "one", label: "$user" },
      reverse: { on: "$users" as any, has: "one", label: "profile" },
    },
  },
});

type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
