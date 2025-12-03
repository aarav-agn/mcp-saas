-- Migration: final_schema
-- Generated: 2025-12-02

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "personalTenantId" TEXT
);

-- Tenants
CREATE TABLE IF NOT EXISTS "Tenant" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "slug" TEXT UNIQUE,
  "ownerId" TEXT,
  "mcpServerId" TEXT,
  "stripeCustomerId" TEXT UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Connector
CREATE TABLE IF NOT EXISTS "Connector" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "config" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_connector_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);

-- Membership
CREATE TABLE IF NOT EXISTS "Membership" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_membership_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT fk_membership_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "user_tenant_unique" ON "Membership" ("userId", "tenantId");
CREATE INDEX IF NOT EXISTS "idx_membership_tenant" ON "Membership" ("tenantId");

-- Subscription & Customer tables
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "stripeId" TEXT NOT NULL UNIQUE,
  "subscriptionItemId" TEXT,
  "planId" TEXT,
  "status" TEXT,
  "currentPeriodEnd" TIMESTAMP WITH TIME ZONE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_subscription_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_subscription_tenant" ON "Subscription" ("tenantId");

CREATE TABLE IF NOT EXISTS "Customer" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT,
  "stripeId" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_customer_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL
);

-- Usage
CREATE TABLE IF NOT EXISTS "Usage" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" INTEGER NOT NULL,
  "recordedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_usage_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_usage_tenant" ON "Usage" ("tenantId");

-- Webhook events
CREATE TABLE IF NOT EXISTS "WebhookEvent" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "stripeId" TEXT NOT NULL UNIQUE,
  "type" TEXT NOT NULL,
  "payload" JSONB,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- MCP Audit Log
CREATE TABLE IF NOT EXISTS "McpAuditLog" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "tenantId" TEXT NOT NULL,
  "toolName" TEXT NOT NULL,
  "input" JSONB,
  "output" JSONB,
  "cost" INTEGER,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  CONSTRAINT fk_audit_tenant FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "idx_mcp_audit_tenant" ON "McpAuditLog" ("tenantId");

-- NextAuth-compatible tables (Account, Session, VerificationToken)
CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  "oauth_token_secret" TEXT,
  "oauth_token" TEXT,
  CONSTRAINT fk_account_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS "account_provider_providerAccountId" ON "Account" ("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT NOT NULL UNIQUE,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP WITH TIME ZONE NOT NULL,
  CONSTRAINT fk_session_user FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "VerificationToken" (
  "identifier" TEXT NOT NULL,
  "token" TEXT NOT NULL UNIQUE,
  "expires" TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "verification_token_unique" ON "VerificationToken" ("identifier", "token");

-- Foreign keys: User.personalTenantId -> Tenant.id
ALTER TABLE "User" ADD CONSTRAINT IF NOT EXISTS fk_user_personal_tenant FOREIGN KEY ("personalTenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL;

-- Indexes for lookup speed
CREATE INDEX IF NOT EXISTS idx_tenant_owner ON "Tenant" ("ownerId");
