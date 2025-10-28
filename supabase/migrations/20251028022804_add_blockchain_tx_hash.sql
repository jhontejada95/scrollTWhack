/*
  # Add blockchain transaction hash column

  1. Changes
    - Add `blockchain_tx_hash` column to `check_ins` table
      - Stores the transaction hash from Scroll Sepolia after registering on-chain
      - Optional field (can be null if blockchain registration fails)
      - Allows tracking and verification of on-chain records

  2. Notes
    - This enables full end-to-end blockchain verification
    - Users can view their transaction on Scrollscan block explorer
    - Maintains backward compatibility with existing check-ins
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'check_ins' AND column_name = 'blockchain_tx_hash'
  ) THEN
    ALTER TABLE check_ins ADD COLUMN blockchain_tx_hash text DEFAULT '';
  END IF;
END $$;
