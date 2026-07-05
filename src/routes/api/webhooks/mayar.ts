import { createFileRoute } from "@tanstack/react-router";

const PREMIUM_DURATION_DAYS = 30;

export const Route = createFileRoute("/api/webhooks/mayar")({
    server: {
        handlers: {
            // Dipakai tombol "Test URL" di dashboard Mayar buat cek konektivitas.
            GET: async () => new Response("ok", { status: 200 }),

            POST: async ({ request }) => {
                // Lapis 1: secret token di URL — tolak kalau gak cocok, sebelum
                // sentuh database sama sekali.
                const url = new URL(request.url);
                const urlToken = url.searchParams.get("token");
                if (!urlToken || urlToken !== process.env.MAYAR_WEBHOOK_SECRET) {
                    console.warn("mayar webhook: invalid url token");
                    return new Response("unauthorized", { status: 401 });
                }

                // Lapis 2: header resmi dari Mayar (ketahuan dari testing —
                // Mayar kirim token verifikasi lewat header "x-callback-token",
                // sama seperti konvensi Xendit). Ini pengaman TAMBAHAN di luar
                // token URL kita sendiri.
                const callbackToken = request.headers.get("x-callback-token");
                if (!callbackToken || callbackToken !== process.env.MAYAR_WEBHOOK_TOKEN) {
                    console.warn("mayar webhook: invalid x-callback-token header");
                    return new Response("unauthorized", { status: 401 });
                }

                let payload: any;
                try {
                    payload = await request.json();
                } catch {
                    return new Response("bad request", { status: 400 });
                }

                const event = payload?.event;
                const eventData = payload?.data;

                /// Cuma proses event pembayaran sukses, abaikan sisanya
                // (termasuk event "testing" dari tombol Test URL). Payload asli
                // Mayar kirim status sebagai string "SUCCESS", bukan boolean true.
                if (event !== "payment.received" || eventData?.status !== "SUCCESS") {
                    return new Response("ignored", { status: 200 });
                }

                const { customerEmail, amount } = eventData;
                if (!customerEmail || typeof amount !== "number") {
                    console.warn("mayar webhook: payload tidak lengkap", eventData);
                    return new Response("ignored", { status: 200 });
                }

                // Load service-role client di dalam handler saja (bukan top-level
                // import) — supaya service role key gak ikut ke-bundle ke client.
                const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

                // Lapis 3: cari baris pending kita sendiri yang cocok.
                const { data: candidate, error: findError } = await supabaseAdmin
                    .from("payments")
                    .select("*")
                    .eq("customer_email", customerEmail)
                    .eq("amount", amount)
                    .eq("status", "pending")
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (findError || !candidate) {
                    console.warn("mayar webhook: no matching pending payment", customerEmail, amount);
                    return new Response("no match", { status: 200 });
                }

                // Lapis 4: re-verify LANGSUNG ke Mayar pakai ID yang KITA simpan —
                // defense-in-depth terakhir sebelum kita percaya penuh.
                const apiKey = process.env.MAYAR_API_KEY;
                const baseUrl = process.env.MAYAR_BASE_URL;
                const verifyRes = await fetch(`${baseUrl}/invoice/${candidate.mayar_invoice_id}`, {
                    headers: { Authorization: `Bearer ${apiKey}` },
                });

                if (!verifyRes.ok) {
                    console.error("mayar webhook: verify call failed", verifyRes.status);
                    return new Response("verify failed", { status: 200 });
                }

                const verifyJson = await verifyRes.json();
                if (verifyJson?.data?.status !== "paid") {
                    console.warn("mayar webhook: invoice belum paid saat di-verify ulang", verifyJson?.data);
                    return new Response("not paid yet", { status: 200 });
                }

                // Semua lapis lolos — upgrade plan user, TAPI hanya kalau baris
                // ini masih "pending" (guard idempotency): kalau webhook yang
                // sama datang 2x (retry dari Mayar, wajar terjadi di semua
                // payment gateway), request kedua tidak boleh ikut mengubah
                // profiles lagi. `.eq("status", "pending")` di update ini
                // membuat operasi jadi atomic — cuma request yang "menang"
                // race condition ini yang dapat baris balik dari `.select()`.
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + PREMIUM_DURATION_DAYS);

                const { data: updatedPayment, error: updatePaymentError } = await supabaseAdmin
                    .from("payments")
                    .update({
                        status: "paid",
                        mayar_transaction_id: verifyJson.data.transactionId ?? candidate.mayar_transaction_id,
                    })
                    .eq("id", candidate.id)
                    .eq("status", "pending")
                    .select()
                    .maybeSingle();

                if (updatePaymentError) {
                    console.error("mayar webhook: gagal update payments", updatePaymentError);
                    return new Response("update failed", { status: 200 });
                }

                if (!updatedPayment) {
                    // Baris sudah "paid" duluan oleh request lain (duplikat/retry
                    // webhook) sebelum kita sempat update — jangan sentuh
                    // profiles lagi, supaya plan_expires_at tidak ke-reset.
                    console.warn("mayar webhook: duplicate/retry diabaikan, payment sudah diproses", candidate.id);
                    return new Response("already processed", { status: 200 });
                }

                await supabaseAdmin
                    .from("profiles")
                    .update({ plan: "premium", plan_expires_at: expiresAt.toISOString() })
                    .eq("user_id", candidate.user_id);

                return new Response("ok", { status: 200 });
            },
        },
    },
});