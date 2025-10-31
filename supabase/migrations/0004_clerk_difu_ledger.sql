-- ================================================
-- CLERK AUTHENTICATION + DIFU LEDGER EXTENSION
-- ================================================
-- Integrates Clerk user authentication with Supabase
-- Adds Digital Instruments of Future Use (DIFU) crypto/digital currency ledger
-- Created: 2025-10-31

-- ================================================
-- CLERK USER PROFILES TABLE
-- ================================================
-- Links Clerk user IDs with local user profiles
CREATE TABLE IF NOT EXISTS clerk_user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  clerk_email TEXT UNIQUE NOT NULL,
  clerk_first_name VARCHAR(255),
  clerk_last_name VARCHAR(255),
  clerk_avatar_url TEXT,
  
  -- Local user data
  username VARCHAR(255) UNIQUE,
  bio TEXT,
  
  -- Account status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'deleted'
  
  -- Timestamps
  synced_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_clerk_profiles_clerk_id ON clerk_user_profiles(clerk_id);
CREATE INDEX idx_clerk_profiles_email ON clerk_user_profiles(clerk_email);
CREATE INDEX idx_clerk_profiles_username ON clerk_user_profiles(username);

-- ================================================
-- DIFU LEDGER TABLE
-- ================================================
-- Digital Instruments of Future Use (DIFU) - Digital Currency Ledger
-- Tracks all DIFU transactions (earn, spend, redeem)
CREATE TABLE IF NOT EXISTS difu_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES clerk_user_profiles(id) ON DELETE CASCADE,
  clerk_id TEXT NOT NULL,
  
  -- Transaction type: 'credit', 'debit', 'redeem', 'bonus', 'refund', 'transfer'
  transaction_type VARCHAR(50) NOT NULL,
  
  -- Amount and balance
  amount DECIMAL(18,8) NOT NULL, -- Support up to 18 digits with 8 decimal places
  balance_after DECIMAL(18,8) NOT NULL,
  
  -- Related collaboration or payment
  collaboration_id UUID REFERENCES collab_sessions(id) ON DELETE SET NULL,
  order_id TEXT,
  
  -- Description and metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Status: 'pending', 'completed', 'failed', 'reversed'
  status VARCHAR(50) DEFAULT 'completed',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_difu_ledger_user ON difu_ledger(user_id);
CREATE INDEX idx_difu_ledger_clerk_id ON difu_ledger(clerk_id);
CREATE INDEX idx_difu_ledger_type ON difu_ledger(transaction_type);
CREATE INDEX idx_difu_ledger_date ON difu_ledger(created_at DESC);
CREATE INDEX idx_difu_ledger_status ON difu_ledger(status);
CREATE INDEX idx_difu_ledger_collab ON difu_ledger(collaboration_id);

-- ================================================
-- DIFU ACCOUNT TABLE
-- ================================================
-- Current DIFU balance per user
CREATE TABLE IF NOT EXISTS difu_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES clerk_user_profiles(id) ON DELETE CASCADE,
  clerk_id TEXT UNIQUE NOT NULL,
  
  -- Current balance
  balance DECIMAL(18,8) DEFAULT 0,
  
  -- Earned (lifetime credit)
  total_earned DECIMAL(18,8) DEFAULT 0,
  
  -- Spent (lifetime debit)
  total_spent DECIMAL(18,8) DEFAULT 0,
  
  -- Frozen balance (pending disputes or holds)
  frozen_balance DECIMAL(18,8) DEFAULT 0,
  
  -- Tier/Level based on balance
  tier VARCHAR(50) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum', 'diamond'
  
  -- Account metadata
  wallet_address TEXT, -- For crypto integration
  preferred_currency VARCHAR(10) DEFAULT 'DIFU',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_difu_accounts_user ON difu_accounts(user_id);
CREATE INDEX idx_difu_accounts_clerk_id ON difu_accounts(clerk_id);
CREATE INDEX idx_difu_accounts_tier ON difu_accounts(tier);

-- ================================================
-- PLUS 1 TEAM PLAN TABLE
-- ================================================
-- Tracks Plus 1 team plan subscriptions
CREATE TABLE IF NOT EXISTS plus_1_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES clerk_user_profiles(id) ON DELETE CASCADE,
  collaboration_id UUID REFERENCES collab_sessions(id) ON DELETE SET NULL,
  
  -- Plan details
  plan_name VARCHAR(50) NOT NULL, -- 'coffee', 'lite', 'superior'
  base_price DECIMAL(10,2) NOT NULL,
  
  -- Collaborator pricing
  collaborator_count INTEGER DEFAULT 0,
  collaborator_price_per_day DECIMAL(10,2) DEFAULT 1.00,
  
  -- Payment model
  payment_model VARCHAR(50) NOT NULL, -- 'daily', 'prepay_7', 'prepay_30'
  total_days_purchased INTEGER DEFAULT 1,
  
  -- DIFU payment
  amount_paid_difu DECIMAL(18,8) DEFAULT 0,
  amount_paid_usd DECIMAL(10,2) DEFAULT 0,
  difu_exchange_rate DECIMAL(18,8) DEFAULT 1.0, -- DIFU per USD
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'expired', 'cancelled'
  
  -- Timestamps
  purchased_at TIMESTAMP DEFAULT NOW(),
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plus1_subscriptions_user ON plus_1_subscriptions(user_id);
CREATE INDEX idx_plus1_subscriptions_collab ON plus_1_subscriptions(collaboration_id);
CREATE INDEX idx_plus1_subscriptions_status ON plus_1_subscriptions(status);
CREATE INDEX idx_plus1_subscriptions_valid_until ON plus_1_subscriptions(valid_until DESC);

-- ================================================
-- PLUS 1 COLLABORATOR ROSTER TABLE
-- ================================================
-- Tracks collaborators added via Plus 1 plan
CREATE TABLE IF NOT EXISTS plus_1_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES plus_1_subscriptions(id) ON DELETE CASCADE,
  host_id UUID REFERENCES clerk_user_profiles(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES clerk_user_profiles(id) ON DELETE CASCADE,
  
  -- Collaborator details from invite
  email VARCHAR(255),
  invited_at TIMESTAMP DEFAULT NOW(),
  accepted_at TIMESTAMP,
  
  -- Payment tracking
  days_active INTEGER DEFAULT 0,
  cost_per_day DECIMAL(10,2) DEFAULT 1.00,
  total_cost DECIMAL(10,2) DEFAULT 0,
  
  -- Status
  status VARCHAR(50) DEFAULT 'invited', -- 'invited', 'accepted', 'active', 'inactive'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plus1_collaborators_subscription ON plus_1_collaborators(subscription_id);
CREATE INDEX idx_plus1_collaborators_host ON plus_1_collaborators(host_id);
CREATE INDEX idx_plus1_collaborators_collab ON plus_1_collaborators(collaborator_id);
CREATE INDEX idx_plus1_collaborators_status ON plus_1_collaborators(status);

-- ================================================
-- DIFU EXCHANGE RATES TABLE
-- ================================================
-- Historical DIFU to USD exchange rates
CREATE TABLE IF NOT EXISTS difu_exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rate: 1 DIFU = X USD
  rate DECIMAL(18,8) NOT NULL,
  
  -- Optional: to crypto prices
  rate_to_btc DECIMAL(18,8),
  rate_to_eth DECIMAL(18,8),
  
  -- Source: 'internal', 'coingecko', 'coinmarketcap'
  source VARCHAR(50) DEFAULT 'internal',
  
  timestamp TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_difu_rates_timestamp ON difu_exchange_rates(timestamp DESC);
CREATE INDEX idx_difu_rates_source ON difu_exchange_rates(source);

-- ================================================
-- DIFU TRANSACTION RULES TABLE
-- ================================================
-- Define how DIFU is earned/spent
CREATE TABLE IF NOT EXISTS difu_transaction_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Rule type: 'earn_collaborator', 'spend_plus1', 'bonus_referral', 'redeem_usd'
  rule_type VARCHAR(50) UNIQUE NOT NULL,
  
  -- Amount and calculation
  amount_difu DECIMAL(18,8) NOT NULL,
  multiplier DECIMAL(10,2) DEFAULT 1.0,
  
  -- Description for ledger
  description TEXT,
  
  -- Active/inactive
  is_active BOOLEAN DEFAULT true,
  
  -- Conditions/metadata
  conditions JSONB DEFAULT '{}',
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_difu_rules_type ON difu_transaction_rules(rule_type);
CREATE INDEX idx_difu_rules_active ON difu_transaction_rules(is_active);

-- ================================================
-- DIFU WITHDRAWAL TABLE
-- ================================================
-- Tracks DIFU redemption/withdrawal to fiat or crypto
CREATE TABLE IF NOT EXISTS difu_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES clerk_user_profiles(id) ON DELETE CASCADE,
  
  -- Withdrawal details
  amount_difu DECIMAL(18,8) NOT NULL,
  amount_usd DECIMAL(10,2),
  
  -- Destination: 'bank_transfer', 'stripe', 'crypto_wallet', 'store_credit'
  destination_type VARCHAR(50) NOT NULL,
  destination_address TEXT,
  
  -- Exchange rate at time of withdrawal
  exchange_rate DECIMAL(18,8),
  
  -- Status: 'pending', 'processing', 'completed', 'failed', 'cancelled'
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Stripe or payment processor reference
  payment_ref TEXT,
  
  -- Timestamps
  requested_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_difu_withdrawals_user ON difu_withdrawals(user_id);
CREATE INDEX idx_difu_withdrawals_status ON difu_withdrawals(status);
CREATE INDEX idx_difu_withdrawals_date ON difu_withdrawals(requested_at DESC);

-- ================================================
-- FUNCTIONS: DIFU ACCOUNT MANAGEMENT
-- ================================================

-- Function to get or create DIFU account
CREATE OR REPLACE FUNCTION get_or_create_difu_account(
  p_user_id UUID,
  p_clerk_id TEXT
)
RETURNS UUID AS $$
DECLARE
  v_account_id UUID;
BEGIN
  -- Try to get existing account
  SELECT id INTO v_account_id
  FROM difu_accounts
  WHERE user_id = p_user_id;
  
  -- If not found, create new account
  IF v_account_id IS NULL THEN
    INSERT INTO difu_accounts (user_id, clerk_id, balance, total_earned, total_spent)
    VALUES (p_user_id, p_clerk_id, 0, 0, 0)
    RETURNING id INTO v_account_id;
  END IF;
  
  RETURN v_account_id;
END;
$$ LANGUAGE plpgsql;

-- Function to credit DIFU to user account
CREATE OR REPLACE FUNCTION credit_difu(
  p_user_id UUID,
  p_amount DECIMAL,
  p_transaction_type VARCHAR,
  p_description TEXT,
  p_collaboration_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_new_balance DECIMAL(18,8);
  v_ledger_id UUID;
  v_clerk_id TEXT;
  v_result JSONB;
BEGIN
  -- Get clerk_id
  SELECT clerk_id INTO v_clerk_id
  FROM clerk_user_profiles
  WHERE id = p_user_id;
  
  IF v_clerk_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Update account balance
  UPDATE difu_accounts
  SET 
    balance = balance + p_amount,
    total_earned = total_earned + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Record in ledger
  INSERT INTO difu_ledger (
    user_id,
    clerk_id,
    transaction_type,
    amount,
    balance_after,
    description,
    collaboration_id,
    status
  )
  VALUES (
    p_user_id,
    v_clerk_id,
    p_transaction_type,
    p_amount,
    v_new_balance,
    p_description,
    p_collaboration_id,
    'completed'
  )
  RETURNING id INTO v_ledger_id;
  
  -- Update tier based on balance
  UPDATE difu_accounts
  SET tier = CASE
    WHEN balance < 100 THEN 'bronze'
    WHEN balance < 500 THEN 'silver'
    WHEN balance < 1000 THEN 'gold'
    WHEN balance < 5000 THEN 'platinum'
    ELSE 'diamond'
  END
  WHERE user_id = p_user_id;
  
  v_result := jsonb_build_object(
    'ledger_id', v_ledger_id,
    'user_id', p_user_id,
    'amount', p_amount,
    'new_balance', v_new_balance,
    'transaction_type', p_transaction_type,
    'timestamp', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to debit DIFU from user account
CREATE OR REPLACE FUNCTION debit_difu(
  p_user_id UUID,
  p_amount DECIMAL,
  p_transaction_type VARCHAR,
  p_description TEXT,
  p_collaboration_id UUID DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_current_balance DECIMAL(18,8);
  v_new_balance DECIMAL(18,8);
  v_ledger_id UUID;
  v_clerk_id TEXT;
  v_result JSONB;
BEGIN
  -- Get clerk_id and current balance
  SELECT clerk_id, balance INTO v_clerk_id, v_current_balance
  FROM difu_accounts
  WHERE user_id = p_user_id;
  
  IF v_clerk_id IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  IF v_current_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient DIFU balance. Current: %, Required: %', v_current_balance, p_amount;
  END IF;
  
  -- Update account balance
  UPDATE difu_accounts
  SET 
    balance = balance - p_amount,
    total_spent = total_spent + p_amount,
    updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance INTO v_new_balance;
  
  -- Record in ledger
  INSERT INTO difu_ledger (
    user_id,
    clerk_id,
    transaction_type,
    amount,
    balance_after,
    description,
    collaboration_id,
    status
  )
  VALUES (
    p_user_id,
    v_clerk_id,
    p_transaction_type,
    -p_amount,
    v_new_balance,
    p_description,
    p_collaboration_id,
    'completed'
  )
  RETURNING id INTO v_ledger_id;
  
  v_result := jsonb_build_object(
    'ledger_id', v_ledger_id,
    'user_id', p_user_id,
    'amount', p_amount,
    'new_balance', v_new_balance,
    'transaction_type', p_transaction_type,
    'timestamp', NOW()
  );
  
  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- PLUS 1 TEAM PLAN FUNCTIONS
-- ================================================

-- Function to create Plus 1 subscription
CREATE OR REPLACE FUNCTION create_plus_1_subscription(
  p_user_id UUID,
  p_plan_name VARCHAR,
  p_payment_model VARCHAR,
  p_total_days INTEGER DEFAULT 1,
  p_amount_usd DECIMAL DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_subscription_id UUID;
  v_base_price DECIMAL(10,2);
  v_valid_until TIMESTAMP;
BEGIN
  -- Determine base price
  v_base_price := CASE
    WHEN p_plan_name = 'coffee' THEN 7.00
    WHEN p_plan_name = 'lite' THEN 20.00
    WHEN p_plan_name = 'superior' THEN 50.00
    ELSE 0.00
  END;
  
  -- Calculate valid_until
  v_valid_until := CASE
    WHEN p_payment_model = 'daily' THEN NOW() + INTERVAL '1 day'
    WHEN p_payment_model = 'prepay_7' THEN NOW() + INTERVAL '7 days'
    WHEN p_payment_model = 'prepay_30' THEN NOW() + INTERVAL '30 days'
    ELSE NOW()
  END;
  
  -- Create subscription
  INSERT INTO plus_1_subscriptions (
    user_id,
    plan_name,
    base_price,
    payment_model,
    total_days_purchased,
    amount_paid_usd,
    valid_until,
    status
  )
  VALUES (
    p_user_id,
    p_plan_name,
    v_base_price,
    p_payment_model,
    p_total_days,
    p_amount_usd,
    v_valid_until,
    'active'
  )
  RETURNING id INTO v_subscription_id;
  
  RETURN v_subscription_id;
END;
$$ LANGUAGE plpgsql;

-- Function to add collaborator to Plus 1 team
CREATE OR REPLACE FUNCTION add_plus_1_collaborator(
  p_subscription_id UUID,
  p_host_id UUID,
  p_collaborator_id UUID,
  p_email VARCHAR
)
RETURNS UUID AS $$
DECLARE
  v_collaborator_rec_id UUID;
  v_cost_per_day DECIMAL(10,2);
BEGIN
  -- Default cost per day
  v_cost_per_day := 1.00;
  
  -- Add collaborator
  INSERT INTO plus_1_collaborators (
    subscription_id,
    host_id,
    collaborator_id,
    email,
    status,
    cost_per_day
  )
  VALUES (
    p_subscription_id,
    p_host_id,
    p_collaborator_id,
    p_email,
    'invited',
    v_cost_per_day
  )
  RETURNING id INTO v_collaborator_rec_id;
  
  -- Update subscription with new collaborator count
  UPDATE plus_1_subscriptions
  SET collaborator_count = collaborator_count + 1
  WHERE id = p_subscription_id;
  
  RETURN v_collaborator_rec_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

ALTER TABLE clerk_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE difu_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE difu_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE plus_1_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE plus_1_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE difu_withdrawals ENABLE ROW LEVEL SECURITY;

-- Clerk user profiles: users can only see their own
CREATE POLICY "Users can view own profile"
ON clerk_user_profiles FOR SELECT
USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- DIFU accounts: users can only see their own
CREATE POLICY "Users can view own DIFU account"
ON difu_accounts FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- DIFU ledger: users can only see their own transactions
CREATE POLICY "Users can view own DIFU ledger"
ON difu_ledger FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Plus 1 subscriptions: users can see their own subscriptions
CREATE POLICY "Users can view own Plus 1 subscriptions"
ON plus_1_subscriptions FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- Plus 1 collaborators: users can see their subscriptions' collaborators
CREATE POLICY "Users can view their collaborators"
ON plus_1_collaborators FOR SELECT
USING (
  host_id = current_setting('request.jwt.claims', true)::json->>'sub'
  OR collaborator_id = current_setting('request.jwt.claims', true)::json->>'sub'
);

-- DIFU withdrawals: users can only see their own
CREATE POLICY "Users can view own withdrawals"
ON difu_withdrawals FOR SELECT
USING (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ================================================
-- SAMPLE DIFU TRANSACTION RULES
-- ================================================

INSERT INTO difu_transaction_rules (rule_type, amount_difu, description, is_active, conditions)
VALUES 
  ('earn_collaborator', 10.0, 'Earn 10 DIFU per successful collaboration session', true, '{"min_duration_minutes": 15}'),
  ('spend_plus1_daily', 1.0, 'Spend 1 DIFU per collaborator per day', true, '{"max_per_day": 100}'),
  ('bonus_referral', 50.0, 'Earn 50 DIFU bonus for successful referral', true, '{"friend_must_spend_difu": 10}'),
  ('bonus_first_collab', 25.0, 'Earn 25 DIFU bonus on first collaboration', true, '{}'),
  ('redeem_usd', 1.0, 'Redeem 1 DIFU = 1 USD to wallet or credit', true, '{}')
ON CONFLICT DO NOTHING;

-- ================================================
-- COMPLETION MESSAGE
-- ================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Clerk + DIFU Ledger Schema Complete!';
  RAISE NOTICE '👤 Tables: clerk_user_profiles, difu_accounts, difu_ledger';
  RAISE NOTICE '💰 Plus 1: plus_1_subscriptions, plus_1_collaborators, difu_exchange_rates';
  RAISE NOTICE '🔐 RLS policies enabled for all tables';
  RAISE NOTICE '⚡ Functions: credit_difu, debit_difu, create_plus_1_subscription, add_plus_1_collaborator';
  RAISE NOTICE '📊 Sample transaction rules inserted';
END $$;
