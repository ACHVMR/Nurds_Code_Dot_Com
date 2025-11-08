-- Phase 1: Creator Economy Plug Store Schema
-- Migration 0007: Add Algorand blockchain integration tables

-- 1. PLUGS TABLE
-- Stores all Plug listings in the Creator Economy marketplace
CREATE TABLE IF NOT EXISTS plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Plug Details
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'tool', 'template', 'component', 'integration', 'theme', 'other'
  
  -- Pricing & Ownership
  pricing_type TEXT NOT NULL, -- 'one-time', 'rental', 'subscription'
  price_usd DECIMAL(10, 2) NOT NULL,
  rental_duration_days INTEGER, -- For rental pricing
  
  -- Algorand Integration
  algorand_asset_id BIGINT UNIQUE, -- Algorand ASA ID (NFT)
  algorand_metadata_url TEXT, -- IPFS or CDN URL to metadata JSON
  
  -- Status
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected', 'archived'
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PLUG_TRANSACTIONS TABLE
-- Records all Plug purchases and transfers
CREATE TABLE IF NOT EXISTS plug_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plug_id UUID NOT NULL REFERENCES plugs(id) ON DELETE CASCADE,
  
  -- Transaction Parties
  buyer_id UUID NOT NULL REFERENCES auth.users(id),
  seller_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Transaction Details
  transaction_type TEXT NOT NULL, -- 'purchase', 'rental', 'transfer', 'resale'
  price_usd DECIMAL(10, 2) NOT NULL,
  royalty_paid_usd DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Paid to original creator
  platform_fee_usd DECIMAL(10, 2) NOT NULL DEFAULT 0, -- Paid to treasury
  
  -- Algorand Integration
  algorand_tx_hash TEXT UNIQUE NOT NULL, -- Blockchain transaction hash
  algorand_confirmed_round BIGINT, -- Block number where confirmed
  
  -- Payment Integration
  stripe_payment_id TEXT, -- If fiat payment used
  
  -- Rental specific
  rental_expires_at TIMESTAMPTZ, -- For rental transactions
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. PLUG_OWNERSHIP TABLE
-- Tracks current ownership of Plugs
CREATE TABLE IF NOT EXISTS plug_ownership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plug_id UUID NOT NULL REFERENCES plugs(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Ownership Details
  ownership_type TEXT NOT NULL, -- 'owned', 'rented'
  acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  rental_expires_at TIMESTAMPTZ, -- NULL for owned, future date for rented
  
  -- Algorand Integration
  algorand_asset_id BIGINT NOT NULL,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(plug_id, owner_id)
);

-- 4. MELANIUM_LEDGER TABLE
-- Tracks all Melanium currency transactions (locked/unlocked)
CREATE TABLE IF NOT EXISTS melanium_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  
  -- Transaction Details
  amount_usd DECIMAL(10, 2) NOT NULL, -- Positive for credit, negative for debit
  transaction_type TEXT NOT NULL, -- 'plug_purchase', 'plug_sale', 'rental_income', 'royalty', 'withdrawal', 'deposit'
  status TEXT NOT NULL DEFAULT 'locked', -- 'locked', 'unlocked', 'withdrawn'
  
  -- References
  source_transaction_id UUID REFERENCES plug_transactions(id),
  
  -- Unlock conditions
  unlocks_at TIMESTAMPTZ, -- When funds become available
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MELANIUM_SUMMARY TABLE
-- Aggregated view of user's Melanium balance
CREATE TABLE IF NOT EXISTS melanium_summary (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  
  -- Balances
  total_locked_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_unlocked_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_withdrawn_usd DECIMAL(10, 2) NOT NULL DEFAULT 0,
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- INDEXES
CREATE INDEX idx_plugs_creator ON plugs(creator_id);
CREATE INDEX idx_plugs_status ON plugs(status);
CREATE INDEX idx_plugs_category ON plugs(category);
CREATE INDEX idx_plugs_algorand_asset ON plugs(algorand_asset_id);

CREATE INDEX idx_plug_transactions_plug ON plug_transactions(plug_id);
CREATE INDEX idx_plug_transactions_buyer ON plug_transactions(buyer_id);
CREATE INDEX idx_plug_transactions_seller ON plug_transactions(seller_id);
CREATE INDEX idx_plug_transactions_type ON plug_transactions(transaction_type);
CREATE INDEX idx_plug_transactions_created ON plug_transactions(created_at DESC);

CREATE INDEX idx_plug_ownership_plug ON plug_ownership(plug_id);
CREATE INDEX idx_plug_ownership_owner ON plug_ownership(owner_id);
CREATE INDEX idx_plug_ownership_type ON plug_ownership(ownership_type);

CREATE INDEX idx_melanium_ledger_user ON melanium_ledger(user_id);
CREATE INDEX idx_melanium_ledger_status ON melanium_ledger(status);
CREATE INDEX idx_melanium_ledger_unlocks ON melanium_ledger(unlocks_at);

-- ROW LEVEL SECURITY (RLS)

-- Enable RLS
ALTER TABLE plugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE plug_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plug_ownership ENABLE ROW LEVEL SECURITY;
ALTER TABLE melanium_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE melanium_summary ENABLE ROW LEVEL SECURITY;

-- PLUGS POLICIES
CREATE POLICY "Users can view approved plugs"
  ON plugs FOR SELECT
  USING (status = 'approved');

CREATE POLICY "Creators can manage their own plugs"
  ON plugs FOR ALL
  USING (creator_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "SuperAdmins can manage all plugs"
  ON plugs FOR ALL
  USING (
    (current_setting('request.jwt.claims', true)::json->>'email')::text = 'owner@nurdscode.com'
  );

-- PLUG_TRANSACTIONS POLICIES
CREATE POLICY "Users can view their own transactions"
  ON plug_transactions FOR SELECT
  USING (
    buyer_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
    OR seller_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid
  );

CREATE POLICY "System can insert transactions"
  ON plug_transactions FOR INSERT
  WITH CHECK (true);

-- PLUG_OWNERSHIP POLICIES
CREATE POLICY "Users can view their own ownership"
  ON plug_ownership FOR SELECT
  USING (owner_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "System can manage ownership"
  ON plug_ownership FOR ALL
  USING (true);

-- MELANIUM_LEDGER POLICIES
CREATE POLICY "Users can view their own ledger"
  ON melanium_ledger FOR SELECT
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "System can insert ledger entries"
  ON melanium_ledger FOR INSERT
  WITH CHECK (true);

-- MELANIUM_SUMMARY POLICIES
CREATE POLICY "Users can view their own summary"
  ON melanium_summary FOR SELECT
  USING (user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::uuid);

CREATE POLICY "System can manage summaries"
  ON melanium_summary FOR ALL
  USING (true);

-- FUNCTIONS

-- Function to update plug updated_at timestamp
CREATE OR REPLACE FUNCTION update_plugs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plugs_updated_at_trigger
  BEFORE UPDATE ON plugs
  FOR EACH ROW
  EXECUTE FUNCTION update_plugs_updated_at();

-- Function to update plug_ownership updated_at timestamp
CREATE OR REPLACE FUNCTION update_plug_ownership_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER plug_ownership_updated_at_trigger
  BEFORE UPDATE ON plug_ownership
  FOR EACH ROW
  EXECUTE FUNCTION update_plug_ownership_updated_at();
