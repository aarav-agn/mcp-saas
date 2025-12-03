// backend/src/routes/billing.routes.ts
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import prisma from "../services/prisma";
import * as stripeSvc from "../billing/stripe.service";
import Stripe from "stripe";
import bodyParser from "body-parser";

const router = Router();

/**
 * Create Stripe customer for tenant (admin role)
 * POST /api/billing/create-customer { tenantId, email }
 */
router.post(
  "/create-customer",
  requireAuth,
  requireRole(["admin", "billing"]),
  asyncHandler(async (req, res) => {
    const { tenantId, email } = req.body;
    const customer = await stripeSvc.createStripeCustomerForTenant(tenantId, email);
    res.json({ customer });
  })
);

/**
 * Create Checkout Session (redirect to Stripe hosted checkout)
 * POST /api/billing/create-checkout { tenantId, priceId }
 */
router.post(
  "/create-checkout",
  requireAuth,
  requireRole(["admin", "billing"]),
  asyncHandler(async (req, res) => {
    const { tenantId, priceId } = req.body;
    const success = `${process.env.FRONTEND_URL}/billing/success`;
    const cancel = `${process.env.FRONTEND_URL}/billing/cancel`;
    const session = await stripeSvc.createCheckoutSessionForTenant(tenantId, priceId, success, cancel);
    res.json({ url: session.url });
  })
);

/**
 * Report usage (metered)
 * POST /api/billing/usage { tenantId, subscriptionItemId, quantity }
 */
router.post(
  "/usage",
  requireAuth,
  requireRole(["admin", "billing"]),
  asyncHandler(async (req, res) => {
    const { tenantId, subscriptionItemId, quantity } = req.body;
    if (!subscriptionItemId) return res.status(400).json({ error: "subscriptionItemId required" });
    const usage = await stripeSvc.recordUsage(subscriptionItemId, Number(quantity || 1));
    await prisma.usage.create({ data: { tenantId, metric: "mcp_calls", value: Number(quantity || 1) }});
    res.json({ usage });
  })
);

/**
 * Webhook (raw body)
 * POST /api/billing/webhook
 */
router.post("/webhook", bodyParser.raw({ type: "application/json" }), asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"] as string | undefined;
  try {
    const stripe = (await import("stripe")).default;
  } catch (e) {
    // ignore
  }
  const StripeLib = (await import("stripe")).default;
  const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2023-08-16" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig ?? "", process.env.STRIPE_WEBHOOK_SECRET ?? "");
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotency: check webhook events table
  const existing = await prisma.webhookEvent.findUnique({ where: { stripeId: event.id }});
  if (existing) return res.status(200).json({ received: true });

  await prisma.webhookEvent.create({ data: { stripeId: event.id, type: event.type, payload: event.data.object as any }});

  const handled = await stripeSvc.handleStripeEvent(event);
  res.json({ received: true, handled });
}));

export default router;
