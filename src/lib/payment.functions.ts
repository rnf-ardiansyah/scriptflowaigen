import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const PREMIUM_PRICE = 20000; // Rp29.000/bulan, sesuai UI upgrade.tsx kamu
const PREMIUM_DURATION_DAYS = 30;

const InputSchema = z.object({
    mobile: z
        .string()
        .trim()
        .min(9, "Nomor HP minimal 9 digit")
        .max(15, "Nomor HP maksimal 15 digit")
        .regex(/^[0-9]+$/, "Nomor HP cuma boleh angka"),
});

export const createUpgradeInvoice = createServerFn({ method: "POST" })
    .middleware([requireSupabaseAuth])
    .validator((data: unknown) => InputSchema.parse(data))
    .handler(async ({ data, context }) => {
        const { supabase, userId, claims } = context;
        const email = (claims.email as string | undefined) ?? "";
        if (!email) {
            throw new Error("Email akun kamu tidak ditemukan, coba login ulang.");
        }

        const apiKey = process.env.MAYAR_API_KEY;
        const baseUrl = process.env.MAYAR_BASE_URL;
        const appUrl = process.env.APP_URL;
        if (!apiKey || !baseUrl || !appUrl) {
            throw new Error("Payment gateway belum dikonfigurasi.");
        }

        const { data: profile } = await supabase
            .from("profiles")
            .select("name")
            .eq("user_id", userId)
            .maybeSingle();

        const res = await fetch(`${baseUrl}/invoice/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                name: profile?.name || "ScriptFlow User",
                email,
                mobile: data.mobile,
                redirectUrl: `${appUrl}/upgrade?status=success`,
                description: `ScriptFlow Premium — ${PREMIUM_DURATION_DAYS} hari`,
                expiredAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                items: [
                    {
                        quantity: 1,
                        rate: PREMIUM_PRICE,
                        description: `ScriptFlow Premium (${PREMIUM_DURATION_DAYS} hari)`,
                    },
                ],
            }),
        });

        if (!res.ok) {
            console.error("mayar create invoice failed", res.status, await res.text());
            throw new Error("Gagal membuat invoice pembayaran. Coba lagi sebentar.");
        }

        const json = await res.json();
        const invoice = json?.data;
        if (!invoice?.link || !invoice?.id) {
            console.error("mayar create invoice: unexpected response", json);
            throw new Error("Respons dari payment gateway tidak lengkap.");
        }

        const { error: insertError } = await supabase.from("payments").insert({
            user_id: userId,
            customer_email: email,
            mayar_invoice_id: invoice.id,
            mayar_transaction_id: invoice.transactionId ?? null,
            amount: PREMIUM_PRICE,
            plan: "premium_month",
            status: "pending",
        });

        if (insertError) {
            console.error("insert pending payment failed", insertError);
            throw new Error("Gagal menyimpan data pembayaran.");
        }

        return { paymentUrl: invoice.link as string };
    });