// backend/src/billing/stripe.service.ts
import Stripe from "stripe";
import prisma from "../services/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2023-08-16" });

export async function createStripeCustomerForTenant(tenantId: string, email?: string) {
  const customer = await stripe.customers.create({ email });
  await prisma.customer.create({ data: { tenantId, stripeId: customer.id } });
  return customer;
}

export async function createCheckoutSessionForTenant(tenantId: string, priceId: string, successUrl: string, cancelUrl: string) {
  const cust = await prisma.customer.findFirst({ where: { tenantId }});
  if (!cust) throw new Error("customer not found");
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: cust.stripeId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl
  });
  return session;
}

/**
 * Record metered usage.
 * subscriptionItemId is required (subscription.items.data[0].id) — store it when creating subscription.
 */
export async function recordUsage(subscriptionItemId: string, quantity: number) {
  const usage = await stripe.subscriptionItems.createUsageRecord(subscriptionItemId, {
    quantity,
    timestamp: Math.floor(Date.now() / 1000),
    action: "increment"
  });
  return usage;
}

/**
 * Webhook processing: returns true on handled
 */
export async function handleStripeEvent(event: Stripe.Event) {
  // Idempotency and DB recorded previously handled in route, but can also be handled here
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customer = await prisma.customer.findUnique({ where: { stripeId: sub.customer as string }});
      if (!customer) return false;
      await prisma.subscription.upsert({
        where: { stripeId: sub.id },
        create: {
          tenantId: customer.tenantId ?? "",
          stripeId: sub.id,
          status: sub.status,
          priceId: sub.items.data[0].price?.id,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null
        },
        update: {
          status: sub.status,
          currentPeriodEnd: sub.current_period_end ? new Date(sub.current_period_end * 1000) : null
        }
      });
      return true;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = await prisma.subscription.findUnique({ where: { stripeId: invoice.subscription as string }});
      if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { status: "active" }});
      return true;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const sub = await prisma.subscription.findUnique({ where: { stripeId: invoice.subscription as string }});
      if (sub) await prisma.subscription.update({ where: { id: sub.id }, data: { status: "past_due" }});
      return true;
    }

    default:
      return false;
  }
}
