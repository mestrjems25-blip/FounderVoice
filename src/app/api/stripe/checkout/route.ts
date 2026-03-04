import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/supabase/session";

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        console.log("[Stripe Init] Key present:", !!process.env.STRIPE_SECRET_KEY);
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        const PRICE_IDS: Record<string, string | undefined> = {
            pro: process.env.STRIPE_PRO_PRICE_ID,
            founder: process.env.STRIPE_FOUNDER_PRICE_ID,
        };

        const supabase = await createSessionClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { tier } = await request.json() as { tier: string };
        const priceId = PRICE_IDS[tier];

        if (!priceId) {
            return NextResponse.json({ error: "Invalid tier or missing price ID" }, { status: 400 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL
            ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

        const session = await stripe.checkout.sessions.create({
            mode: "subscription",
            line_items: [{ price: priceId, quantity: 1 }],
            success_url: `${baseUrl}/dashboard/billing?success=true`,
            cancel_url: `${baseUrl}/dashboard/billing`,
            customer_email: user.email,
            metadata: { userId: user.id, tier },
            client_reference_id: user.id,
        });

        return NextResponse.json({ url: session.url });
    } catch (err) {
        console.error("[stripe/checkout]", err);
        return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
    }
}
