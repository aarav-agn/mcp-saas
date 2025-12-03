# Migration: final_schema

This migration creates the complete schema for the MCP SaaS project:
- Users (with hashed passwords)
- Tenants (ownerId, stripeCustomerId, personal tenant support)
- Membership (multi-tenant RBAC)
- Connectors (per-tenant config)
- Subscription, Customer, Usage, WebhookEvent (Stripe)
- McpAuditLog (tool invocation audit with cost)
- NextAuth-compatible tables (Account, Session, VerificationToken)

## How to apply (development)

1. Ensure DATABASE_URL in backend/.env points to a dev Postgres instance.
2. From repository root:

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name final_schema
# or for a production deploy:
npx prisma migrate deploy
