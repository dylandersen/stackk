# Anthropic Integration Plan for Stackk

## Overview

Build an Anthropic integration into Stackk that allows users to track their Claude subscriptions (Claude Pro, Claude Team) and usage metrics. This integration will follow the existing patterns established by the Supabase and Vercel integrations.

---

## Goals

1. **Track Anthropic Subscriptions**: Display subscription tier (Free, Pro, Team, Enterprise)
2. **Monitor Usage**: Show API usage, token consumption, and spending limits
3. **Sync Subscription Data**: Auto-refresh billing cycle, costs, and plan details
4. **Seamless Authentication**: Use Anthropic OAuth or API key authentication
5. **Follow Existing Patterns**: Maintain consistency with current integration architecture

---

## Architecture Design

### Authentication Strategy

**Recommended Approach: OAuth 2.0 with PKCE** (similar to Supabase integration)

- Anthropic supports OAuth for workspace/organization access
- More secure than API keys
- Allows automatic token refresh
- Better user experience (no manual key copying)

**Fallback: API Key Authentication** (similar to Vercel integration)

- For users without OAuth access or for personal API keys
- Direct token validation through Anthropic API
- Simpler but requires manual updates

---

## Database Schema Changes

### New Fields to Add to `services` Entity

Add to `instant.schema.ts`:

```typescript
// Anthropic Integration Fields
anthropicTokenHash: string (encrypted access token)
anthropicRefreshTokenHash: string (encrypted refresh token for OAuth)
anthropicWorkspaceId: string (workspace/organization ID)
anthropicPlan: string ('free' | 'pro' | 'team' | 'enterprise')
anthropicUserId: string (user identifier from Anthropic)
anthropicDataCache: string (JSON cache of API responses)
anthropicDataFetchedAt: number (timestamp of last cache update)
anthropicConnectedAt: number (timestamp of connection)
```

**Storage Pattern**: Follow Supabase model - encrypted tokens, JSON cache for quick loading, timestamp tracking.

---

## API Routes to Build

Create in `/app/api/anthropic/`:

### 1. OAuth Flow Routes (Preferred Method)

**`/api/anthropic/oauth/initiate` (GET)**

**Purpose**: Start OAuth flow with Anthropic

**Cursor Prompt**:
> Create an OAuth initiation endpoint that generates PKCE code verifier and challenge, stores them in secure httpOnly cookies with 10-minute expiry, and redirects users to Anthropic's OAuth authorization page. Include state parameter for CSRF protection. Follow the pattern used in `/app/api/supabase/oauth/initiate`.

---

**`/api/anthropic/oauth/callback` (GET)**

**Purpose**: Handle OAuth callback and exchange code for tokens

**Cursor Prompt**:
> Build an OAuth callback handler that validates the state token, exchanges the authorization code for access and refresh tokens using PKCE verification, encrypts both tokens using the existing encryption utility, stores them in temporary httpOnly cookies (1-hour expiry), and redirects to the workspace selection page. Handle errors gracefully with query parameters. Follow the Supabase callback pattern.

---

### 2. Connection Routes

**`/api/anthropic/workspaces` (GET)**

**Purpose**: Fetch user's workspaces/organizations

**Cursor Prompt**:
> Create an endpoint that reads encrypted tokens from cookies, decrypts them, fetches all Anthropic workspaces the user has access to via the Anthropic Management API, and returns workspace data (id, name, plan tier). Include error handling for expired tokens and API failures. Similar to `/api/supabase/projects`.

---

**`/api/anthropic/connect` (POST)**

**Purpose**: Create service record with workspace data

**Cursor Prompt**:
> Build a connection endpoint that receives workspace ID, userId, and reads tokens from cookies. Create or update a service record in InstantDB with encrypted tokens, workspace details, plan information, and initial metadata. Set `connected: true`, `category: 'AI & ML'`, and auto-generate color/logo. Clean up temporary OAuth cookies after successful connection. Support both new connections and updating existing ones.

---

### 3. Data Sync Routes

**`/api/anthropic/sync` (POST)**

**Purpose**: Quick sync for subscription status

**Cursor Prompt**:
> Create a lightweight sync endpoint that validates the Anthropic access token, checks if refresh is needed (handle 401 errors by using refresh token), fetches current subscription status, and returns updates for `status`, `nextPayment`, `price`, and `lastSyncedAt`. If token is refreshed, return new encrypted tokens to update in the database. Keep this fast and minimal for regular status checks.

---

**`/api/anthropic/data` (POST)**

**Purpose**: Fetch comprehensive usage and billing data

**Cursor Prompt**:
> Build a comprehensive data fetching endpoint that retrieves detailed information from Anthropic's API including:
> - Subscription details (plan, billing cycle, next payment)
> - Usage metrics (API calls, tokens consumed, current period usage)
> - Spending limits and overages
> - User/workspace information
>
> Cache the response as a JSON string in `anthropicDataCache` with timestamp in `anthropicDataFetchedAt`. Handle token refresh if needed. Return structured data for UI consumption. Follow the pattern in `/api/supabase/data`.

---

**`/api/anthropic/disconnect` (POST)**

**Purpose**: Clean disconnection

**Cursor Prompt**:
> Create a disconnect endpoint that revokes the OAuth refresh token with Anthropic (if using OAuth), removes encrypted tokens from the database, sets `connected: false`, and clears cached data. Handle errors gracefully if revocation fails but still clean up local data.

---

## API Key Authentication Alternative

### `/api/anthropic/connect-key` (POST)

**Purpose**: Direct API key connection (alternative to OAuth)

**Cursor Prompt**:
> Build an API key connection endpoint that receives an Anthropic API key and userId, validates the key by making a test request to Anthropic's API (e.g., `/v1/users/me`), encrypts the key, creates a service record with plan information extracted from the API response, and returns the service object. Set `connected: true` and appropriate metadata. Similar to `/app/api/vercel/connect`.

---

## UI Components to Build

### 1. Service Detail Page

**File**: `/app/services/anthropic-[workspaceId]/page.tsx`

**Cursor Prompt**:
> Create an Anthropic service detail page that displays:
> - Subscription tier with color-coded badge (Free/Pro/Team/Enterprise)
> - Current billing cycle and next payment date
> - Usage metrics section showing API calls and token consumption
> - Refresh button to fetch latest data from Anthropic
> - Disconnect button with confirmation dialog
> - Last synced timestamp
>
> Load cached data from `anthropicDataCache` on mount for instant display, then allow manual refresh via "Refresh Data" button. Handle loading states and errors. Follow the layout patterns from the Supabase detail page.

---

### 2. Usage Charts Component

**File**: `/components/AnthropicUsageChart.tsx`

**Cursor Prompt**:
> Build a usage visualization component that displays Anthropic API usage over time using Recharts (already in dependencies). Show:
> - Token consumption trends
> - API request volume
> - Cost tracking if available
>
> Accept data from `anthropicDataCache` and render responsive charts. Include empty states for when no usage data is available. Style consistently with existing chart components like `SupabaseUsageChart` and `DeploymentFrequencyChart`.

---

### 3. Workspace Selection Page (for OAuth)

**File**: `/app/services/add/anthropic/select/page.tsx`

**Cursor Prompt**:
> Create a workspace selection page for OAuth users. Fetch available workspaces from `/api/anthropic/workspaces`, display them in a grid with workspace name and plan tier, allow users to select which workspace to connect, and submit the selection to `/api/anthropic/connect`. Show loading and error states. After successful connection, redirect to the service detail page with `autoRefresh=true`. Follow the pattern from `/services/add/supabase/select`.

---

### 4. Add Service Modal Updates

**File**: `/components/AddServiceModal.tsx`

**Cursor Prompt**:
> Add Anthropic to the integrations list in the AddServiceModal. Include:
> - Service name: "Anthropic"
> - Category: "AI & ML"
> - Logo: Use Anthropic's brand logo
> - Color: Anthropic brand orange (#FF6B00 or similar)
> - Click handler: Redirect to `/api/anthropic/oauth/initiate` for OAuth flow
>
> Alternatively, add a toggle to choose between OAuth and API key authentication. If API key is selected, show an input field for the key and call `/api/anthropic/connect-key` on submit.

---

### 5. Summary Stats Component

**File**: `/components/AnthropicSummaryStats.tsx`

**Cursor Prompt**:
> Create a summary statistics component that displays key Anthropic metrics in a grid layout:
> - Current plan tier
> - API requests this month
> - Tokens consumed
> - Estimated cost or remaining quota
>
> Pull data from the service's `anthropicDataCache`. Use the same card styling as `SupabaseSummaryStats` for visual consistency. Handle missing data gracefully with placeholder text.

---

## External API Integration

### Anthropic API Wrapper

**File**: `/lib/anthropic-api.ts`

**Cursor Prompt**:
> Build an Anthropic API client wrapper that handles:
> - Authentication with access tokens
> - Workspace/organization endpoints
> - User information retrieval
> - Usage statistics and billing data
> - Token refresh logic
> - Error handling with typed responses
>
> Export typed functions like `getWorkspaces()`, `getUserInfo()`, `getUsageStats()`, `getBillingInfo()`, and `refreshAccessToken()`. Use fetch for HTTP requests and follow patterns from `lib/supabase-api.ts`. Include proper TypeScript types for all responses.

---

## TypeScript Types

### New Types to Add

**File**: `/types.ts`

**Cursor Prompt**:
> Add TypeScript interfaces for Anthropic integration:
>
> ```typescript
> interface AnthropicWorkspace {
>   id: string;
>   name: string;
>   plan: 'free' | 'pro' | 'team' | 'enterprise';
>   created_at: string;
> }
>
> interface AnthropicUsageData {
>   api_requests: number;
>   tokens_consumed: number;
>   period_start: string;
>   period_end: string;
>   spending_limit?: number;
>   current_spending?: number;
> }
>
> interface AnthropicBillingInfo {
>   plan: string;
>   price: number;
>   currency: string;
>   billing_cycle: 'monthly' | 'annual';
>   next_payment_date: string;
> }
>
> interface AnthropicDataCache {
>   workspace: AnthropicWorkspace;
>   usage: AnthropicUsageData;
>   billing: AnthropicBillingInfo;
>   fetched_at: string;
> }
> ```

---

## Constants and Configuration

### Service Configuration

**File**: `/constants.ts`

**Cursor Prompt**:
> Add Anthropic to the service configurations:
> - Add to `SERVICE_COLORS` with Anthropic brand color (#FF6B00)
> - Add to `SERVICE_LOGOS` with path to Anthropic logo
> - Add to `SERVICE_CATEGORIES` under 'AI & ML' or create new category
> - Add pricing tiers for different Claude plans (Free: $0, Pro: $20, Team: $30/seat, Enterprise: custom)

---

**File**: `.env.local` (Environment Variables)

**Cursor Prompt**:
> Add required Anthropic OAuth configuration to environment variables:
> ```
> ANTHROPIC_CLIENT_ID=your_client_id
> ANTHROPIC_CLIENT_SECRET=your_client_secret
> ANTHROPIC_OAUTH_REDIRECT_URI=http://localhost:3000/api/anthropic/oauth/callback
> ```
> Document these in README.md with instructions on how to obtain them from Anthropic's developer console.

---

## Implementation Phases

### Phase 1: Foundation (Core Infrastructure)
**Focus**: Get authentication and basic connection working

1. Update database schema with Anthropic fields
2. Build OAuth initiate and callback routes
3. Create Anthropic API wrapper (`anthropic-api.ts`)
4. Add Anthropic option to AddServiceModal
5. Test: User can connect Anthropic account and see it in service list

---

### Phase 2: Data Sync (Subscription & Usage)
**Focus**: Fetch and display real data

1. Build `/api/anthropic/data` endpoint
2. Build `/api/anthropic/sync` endpoint
3. Create service detail page showing subscription info
4. Add refresh functionality
5. Test: User can see current plan, usage, and sync data

---

### Phase 3: Visualization (Usage Analytics)
**Focus**: Rich data display

1. Build `AnthropicUsageChart` component
2. Build `AnthropicSummaryStats` component
3. Enhance detail page with charts and stats
4. Add last synced indicator
5. Test: User sees comprehensive usage analytics

---

### Phase 4: Polish (UX Improvements)
**Focus**: Edge cases and refinement

1. Build workspace selection page (if multi-workspace support)
2. Add disconnect functionality
3. Handle token refresh edge cases
4. Add loading skeletons and error states
5. Add API key authentication as alternative
6. Test: Full user journey works smoothly

---

## Testing Checklist

### Functional Tests
- [ ] OAuth flow completes successfully
- [ ] Tokens are encrypted before storage
- [ ] Service appears in dashboard after connection
- [ ] Sync updates subscription status correctly
- [ ] Data fetch retrieves usage metrics
- [ ] Refresh button updates data
- [ ] Token refresh works when access token expires
- [ ] Disconnect removes service cleanly
- [ ] Error handling shows appropriate messages

### Security Tests
- [ ] Tokens never exposed in client-side code
- [ ] CSRF protection works (state parameter validated)
- [ ] Cookies are httpOnly and secure in production
- [ ] Encrypted tokens cannot be decrypted without key
- [ ] API routes require authentication

### UI/UX Tests
- [ ] Service card matches design system
- [ ] Loading states show during async operations
- [ ] Error messages are user-friendly
- [ ] Mobile responsive design works
- [ ] Charts render correctly with real data
- [ ] Empty states handled gracefully

---

## Research & Prerequisites

### Questions to Answer Before Starting

1. **Anthropic API Documentation**
   - Does Anthropic provide a public Management API?
   - What authentication methods are supported?
   - What endpoints are available for billing/usage?
   - Rate limits and quotas?

2. **OAuth Configuration**
   - Does Anthropic support OAuth 2.0?
   - How to register OAuth application?
   - Scopes needed for workspace/billing access?

3. **Plan Detection**
   - How to programmatically detect plan tier (Pro vs Team)?
   - Can we get usage data for Free tier users?
   - Is there a separate API for Claude Code subscriptions?

4. **Data Availability**
   - What usage metrics are exposed?
   - Token consumption tracking available?
   - Billing history accessible?

### API Endpoints to Research

Likely endpoints needed (verify with Anthropic docs):
- `GET /v1/workspaces` - List user's workspaces
- `GET /v1/workspaces/:id` - Workspace details
- `GET /v1/usage` - Usage statistics
- `GET /v1/billing` - Billing information
- `GET /v1/users/me` - Current user info
- `POST /oauth/token` - Token exchange/refresh

---

## Success Criteria

### Minimum Viable Integration (MVP)
- ✅ Users can connect their Anthropic account
- ✅ Current Claude subscription tier is displayed
- ✅ Basic usage metrics shown (API calls, tokens)
- ✅ Subscription cost and next payment tracked
- ✅ Data refreshes on demand

### Enhanced Features (V2)
- Multiple workspace support
- Historical usage trends
- Cost forecasting
- Budget alerts
- Claude Code specific tracking
- Model usage breakdown (Claude 3 Opus vs Sonnet, etc.)

---

## Development Notes

### Following Existing Patterns

**Do's:**
- ✅ Use encryption for all tokens
- ✅ Store comprehensive data in `*DataCache`
- ✅ Prefix all fields with `anthropic*`
- ✅ Use httpOnly cookies for OAuth flow
- ✅ Implement token refresh logic
- ✅ Follow the same error handling patterns
- ✅ Match existing UI component styling
- ✅ Use InstantDB transactions for updates

**Don'ts:**
- ❌ Don't store tokens in localStorage
- ❌ Don't expose tokens in client components
- ❌ Don't skip CSRF protection in OAuth
- ❌ Don't create new patterns - reuse existing ones
- ❌ Don't forget to handle token refresh
- ❌ Don't make API calls from client components

---

## Open Questions

1. **Claude Code vs General Anthropic**: Should we track Claude Code subscriptions separately from general Anthropic API usage, or combine them?

2. **Multi-Workspace**: Do users typically have multiple Anthropic workspaces like they do with Supabase projects?

3. **Logo & Branding**: Confirm Anthropic's brand guidelines for logo usage and colors

4. **API Access**: Verify that Anthropic's API exposes billing and subscription information (not all platforms do)

---

## Next Steps

1. **Research Phase**: Investigate Anthropic's API capabilities and OAuth support
2. **Design Review**: Confirm UI/UX matches design system
3. **Environment Setup**: Obtain OAuth credentials from Anthropic
4. **Spike**: Build minimal OAuth flow to validate approach
5. **Implementation**: Follow phases 1-4 outlined above
6. **Testing**: Complete testing checklist
7. **Documentation**: Update README with Anthropic integration setup

---

## Resources & References

- **Anthropic Documentation**: https://docs.anthropic.com
- **Existing Patterns**: See `/app/api/supabase/` for OAuth reference
- **Encryption Utility**: `/lib/encryption.ts`
- **Database Schema**: `/instant.schema.ts`
- **Service Card Component**: `/components/ServiceCard.tsx`

---

_This plan prioritizes following existing architectural patterns to ensure consistency, maintainability, and faster development. Each cursor prompt is designed to give clear direction while allowing flexibility in implementation details._
