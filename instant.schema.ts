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
      sortOrder: i.number().optional(), // Custom sort order for drag-and-drop
      createdAt: i.string().optional(), // ISO timestamp when service was added
      // Vercel integration fields
      vercelTokenHash: i.string().optional(), // Encrypted/hashed Vercel API token
      vercelUserId: i.string().optional(), // Vercel user ID
      vercelTeamId: i.string().optional(), // Primary team ID
      vercelPlan: i.string().optional(), // Vercel plan name (hobby, pro, enterprise)
      vercelConnectedAt: i.string().optional(), // ISO timestamp of connection
      lastSyncedAt: i.string().optional(), // Last successful sync timestamp
      syncError: i.string().optional(), // Last sync error message
      vercelDataCache: i.string().optional(), // JSON string of cached Vercel projects/deployments data
      vercelDataFetchedAt: i.string().optional(), // ISO timestamp when data was last fetched
      // Supabase integration fields
      supabaseTokenHash: i.string().optional(), // Encrypted access token
      supabaseRefreshTokenHash: i.string().optional(), // Encrypted refresh token  
      supabaseProjects: i.string().optional(), // JSON array of connected projects [{id, ref, name, organizationId, ...}]
      supabaseOrganizationId: i.string().optional(), // Organization ID (from first project)
      supabasePlan: i.string().optional(), // Plan name (free, pro, team, enterprise) - aggregated from all projects
      supabaseConnectedAt: i.string().optional(), // ISO timestamp of connection
      supabaseDataCache: i.string().optional(), // JSON string of cached project/billing data for all projects
      supabaseDataFetchedAt: i.string().optional(), // ISO timestamp when data was last fetched
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
      monthlyBudget: i.number().optional(), // Monthly budget in dollars
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
