// backend/src/admin/ops.ts
import prisma from "../services/prisma";

/**
 * Save subscriptionItemId for tenant's subscription.
 * You should call this after subscription creation (from webhook or create-checkout result).
 */
export async function saveSubscriptionItem(tenantId: string, stripeSubscriptionId: string, subscriptionItemId: string) {
  const sub = await prisma.subscription.findUnique({ where: { stripeId: stripeSubscriptionId }});
  if (sub) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { subscriptionItemId } as any });
  } else {
    await prisma.subscription.create({
      data: {
        tenantId,
        stripeId: stripeSubscriptionId,
        subscriptionItemId,
        status: "active"
      } as any
    });
  }
}
