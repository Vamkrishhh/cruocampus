-- Fix search_path for update_updated_at function
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix search_path for generate_booking_qr function
CREATE OR REPLACE FUNCTION public.generate_booking_qr()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.qr_code = encode(gen_random_bytes(16), 'hex');
  RETURN NEW;
END;
$$;