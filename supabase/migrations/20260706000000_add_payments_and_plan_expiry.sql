-- Kolom masa aktif premium di profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamptz;

-- Tabel payments: jejak setiap invoice yang pernah dibuat
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_email text NOT NULL,
  mayar_invoice_id text NOT NULL UNIQUE,
  mayar_transaction_id text,
  amount integer NOT NULL,
  plan text NOT NULL DEFAULT 'premium_month',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','expired')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_user_idx ON public.payments (user_id, created_at DESC);
CREATE INDEX payments_pending_lookup_idx ON public.payments (status, customer_email, amount);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- User cuma boleh lihat & bikin baris punya sendiri (status awal selalu 'pending')
CREATE POLICY "payments_select_own" ON public.payments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "payments_insert_own" ON public.payments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- SENGAJA tidak ada UPDATE/DELETE policy untuk authenticated —
-- cuma service_role (dipakai webhook) yang boleh ubah status jadi 'paid'.
GRANT SELECT, INSERT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

-- Reuse function set_updated_at() yang sudah ada dari migration sebelumnya
CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();