-- Plug Store Database Schema
-- Creator Economy Tables

-- =============================================
-- TABLE: creators
-- Stores creator profiles and subscription info
-- =============================================
CREATE TABLE IF NOT EXISTS creators (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  website TEXT,
  twitter_handle TEXT,
  github_handle TEXT,
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'creator', 'pro', 'enterprise')),
  stripe_account_id TEXT, -- Stripe Connect account for payouts
  wallet_address TEXT, -- Web3 wallet for crypto payouts
  total_earnings DECIMAL(12,2) DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public creators are viewable" ON creators
  FOR SELECT USING (true);
  
CREATE POLICY "Users can update own creator profile" ON creators
  FOR UPDATE USING (auth.uid() = user_id);

-- =============================================
-- TABLE: plugs
-- Stores published applications/plugs
-- =============================================
CREATE TABLE IF NOT EXISTS plugs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES creators(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  
  -- Pricing
  pricing_model TEXT DEFAULT 'one_time' CHECK (pricing_model IN ('one_time', 'rental', 'subscription', 'freemium', 'pay_what_you_want', 'nft')),
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  rental_days INTEGER, -- For rental pricing
  stripe_price_id TEXT,
  
  -- Media
  thumbnail_url TEXT,
  screenshots TEXT[] DEFAULT '{}',
  demo_video_url TEXT,
  preview_url TEXT, -- Live demo URL
  
  -- Technical
  version TEXT DEFAULT '1.0.0',
  framework TEXT,
  tech_stack TEXT[] DEFAULT '{}',
  source_url TEXT, -- Encrypted source location in R2
  bundle_size_kb INTEGER,
  
  -- Web3
  ipfs_cid TEXT, -- IPFS content identifier
  nft_contract_address TEXT,
  nft_token_id TEXT,
  
  -- Stats
  downloads INTEGER DEFAULT 0,
  ratings_sum INTEGER DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'rejected', 'archived')),
  rejection_reason TEXT,
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Settings
  allow_reviews BOOLEAN DEFAULT TRUE,
  allow_comments BOOLEAN DEFAULT TRUE,
  support_email TEXT,
  documentation_url TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_plugs_category ON plugs(category);
CREATE INDEX idx_plugs_creator ON plugs(creator_id);
CREATE INDEX idx_plugs_status ON plugs(status);
CREATE INDEX idx_plugs_pricing ON plugs(pricing_model);

-- Enable RLS
ALTER TABLE plugs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Published plugs are viewable" ON plugs
  FOR SELECT USING (status = 'published' OR creator_id IN (
    SELECT id FROM creators WHERE user_id = auth.uid()
  ));

CREATE POLICY "Creators can manage own plugs" ON plugs
  FOR ALL USING (creator_id IN (
    SELECT id FROM creators WHERE user_id = auth.uid()
  ));

-- =============================================
-- TABLE: plug_versions
-- Version history for each plug
-- =============================================
CREATE TABLE IF NOT EXISTS plug_versions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plug_id UUID REFERENCES plugs(id) ON DELETE CASCADE NOT NULL,
  version TEXT NOT NULL,
  changelog TEXT,
  source_url TEXT NOT NULL,
  bundle_size_kb INTEGER,
  is_stable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(plug_id, version)
);

-- Enable RLS
ALTER TABLE plug_versions ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABLE: purchases
-- Records of plug purchases/rentals
-- =============================================
CREATE TABLE IF NOT EXISTS purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plug_id UUID REFERENCES plugs(id) ON DELETE SET NULL NOT NULL,
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  
  -- Transaction
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  platform_fee DECIMAL(10,2),
  creator_earnings DECIMAL(10,2),
  stripe_payment_intent_id TEXT,
  
  -- License
  license_key TEXT UNIQUE NOT NULL,
  license_type TEXT CHECK (license_type IN ('perpetual', 'rental', 'subscription')),
  expires_at TIMESTAMP WITH TIME ZONE,
  domains TEXT[] DEFAULT '{}', -- Allowed domains
  max_activations INTEGER DEFAULT 1,
  activations_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'revoked', 'refunded')),
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes
CREATE INDEX idx_purchases_buyer ON purchases(buyer_id);
CREATE INDEX idx_purchases_plug ON purchases(plug_id);
CREATE INDEX idx_purchases_license ON purchases(license_key);

-- Enable RLS
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own purchases" ON purchases
  FOR SELECT USING (buyer_id = auth.uid());

CREATE POLICY "Creators can view sales" ON purchases
  FOR SELECT USING (creator_id IN (
    SELECT id FROM creators WHERE user_id = auth.uid()
  ));

-- =============================================
-- TABLE: reviews
-- User reviews for plugs
-- =============================================
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plug_id UUID REFERENCES plugs(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT,
  content TEXT,
  helpful_count INTEGER DEFAULT 0,
  verified_purchase BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(plug_id, user_id)
);

-- Enable RLS
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- =============================================
-- TABLE: plug_analytics
-- Analytics data for creators
-- =============================================
CREATE TABLE IF NOT EXISTS plug_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  plug_id UUID REFERENCES plugs(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  country_breakdown JSONB DEFAULT '{}',
  referrer_breakdown JSONB DEFAULT '{}',
  UNIQUE(plug_id, date)
);

-- Enable RLS
ALTER TABLE plug_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to generate license key
CREATE OR REPLACE FUNCTION generate_license_key()
RETURNS TEXT AS $$
DECLARE
  key TEXT;
BEGIN
  key := encode(gen_random_bytes(24), 'base64');
  key := replace(key, '/', 'X');
  key := replace(key, '+', 'Y');
  RETURN 'PLUG-' || substring(key, 1, 8) || '-' || 
         substring(key, 9, 4) || '-' || 
         substring(key, 13, 4) || '-' || 
         substring(key, 17, 8);
END;
$$ LANGUAGE plpgsql;

-- Function to validate license
CREATE OR REPLACE FUNCTION validate_license(license_key_input TEXT, domain_input TEXT)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
  purchase_record RECORD;
BEGIN
  SELECT * INTO purchase_record
  FROM purchases
  WHERE license_key = license_key_input
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('valid', false, 'error', 'License not found');
  END IF;
  
  IF purchase_record.status != 'active' THEN
    RETURN jsonb_build_object('valid', false, 'error', 'License ' || purchase_record.status);
  END IF;
  
  IF purchase_record.expires_at IS NOT NULL AND purchase_record.expires_at < NOW() THEN
    UPDATE purchases SET status = 'expired' WHERE id = purchase_record.id;
    RETURN jsonb_build_object('valid', false, 'error', 'License expired');
  END IF;
  
  IF array_length(purchase_record.domains, 1) > 0 AND 
     NOT (domain_input = ANY(purchase_record.domains)) THEN
    RETURN jsonb_build_object('valid', false, 'error', 'Domain not authorized');
  END IF;
  
  RETURN jsonb_build_object(
    'valid', true,
    'plug_id', purchase_record.plug_id,
    'license_type', purchase_record.license_type,
    'expires_at', purchase_record.expires_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
