import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

    const body = await request.text();
    const sig = request.headers.get("stripe-signature") ?? "";

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch {
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;

        if (userId && tier) {
            const supabase = createServerClient();
            await supabase
                .from("profiles")
                .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
                .eq("id", userId);
        }
    }

    if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata?.userId;

        if (userId) {
            const supabase = createServerClient();
            await supabase
                .from("profiles")
                .update({ subscription_tier: "basic", updated_at: new Date().toISOString() })
                .eq("id", userId);
        }
    }

    return NextResponse.json({ received: true });
}
