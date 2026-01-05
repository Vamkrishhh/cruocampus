-- Enable pgcrypto extension for gen_random_bytes function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add new room type for sports facilities
ALTER TYPE room_type ADD VALUE IF NOT EXISTS 'sports_facility';

-- Add new equipment type column for sports equipment tracking
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS available_quantity integer DEFAULT 1;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS max_booking_hours integer DEFAULT 4;