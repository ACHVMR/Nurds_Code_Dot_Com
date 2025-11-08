# PHASE 1 QUICK START GUIDE
**Nurds Code - Algorand Blockchain Integration**  
**Status:** Ready to Begin  
**Timeline:** 2 weeks (10 working days)  
**Last Updated:** November 4, 2025

---

## 🎯 **PHASE 1 OVERVIEW**

### **Goal:**
Integrate Algorand blockchain for NFT-based Plug ownership + Creator Economy marketplace foundation

### **What You'll Build:**
1. ✅ Algorand SDK integration (NFT minting)
2. ✅ Pera Wallet connection (user wallets)
3. ✅ Database schema for Plug Store
4. ✅ Plug creation workflow (submit → mint → approve)
5. ✅ SuperAdmin approval dashboard

### **Tech Stack:**
- **Blockchain:** Algorand (testnet)
- **Wallet:** Pera Wallet Connect
- **Database:** Supabase (PostgreSQL with RLS)
- **Auth:** Clerk (already integrated)
- **Frontend:** React 19 + Vite

---

## 📋 **DAY-BY-DAY BREAKDOWN**

### **Day 1-2: Environment Setup** ⏱️ 4 hours

#### **1.1 Install Algorand SDK**
```bash
npm install algosdk @perawallet/connect --save
```

#### **1.2 Create Algorand Testnet Account**
1. Visit: https://testnet.algoexplorer.io/dispenser
2. Generate new account
3. Save mnemonic phrase (25 words) securely
4. Request testnet ALGO from faucet

#### **1.3 Get PureStake API Key**
1. Visit: https://developer.purestake.io/
2. Sign up for free account
3. Create new app
4. Copy API key

#### **1.4 Update Environment Variables**

**File: `.env.local`**
```bash
# Algorand Testnet Configuration
VITE_ALGOD_TOKEN=your-purestake-api-key-here
VITE_ALGOD_SERVER=https://testnet-algorand.api.purestake.io/ps2
VITE_ALGOD_PORT=
VITE_INDEXER_SERVER=https://testnet-algorand.api.purestake.io/idx2

# Nurds Code Treasury Address (for royalties)
VITE_TREASURY_ADDRESS=your-algorand-address-here
```

**File: `wrangler.toml`** (for Cloudflare Workers)
```toml
[vars]
ALGOD_SERVER = "https://testnet-algorand.api.purestake.io/ps2"
ALGOD_PORT = ""
INDEXER_SERVER = "https://testnet-algorand.api.purestake.io/idx2"

[[kv_namespaces]]
binding = "NURDS_KV"
id = "your-kv-namespace-id"

# Add secrets via CLI:
# wrangler secret put ALGOD_TOKEN
# wrangler secret put TREASURY_MNEMONIC
```

#### **1.5 Test Connection**
```bash
node scripts/test-algorand-connection.js
```

Expected output:
```
✅ Connected to Algorand Testnet
✅ API Key valid
✅ Current block: 35234567
✅ Treasury balance: 10.5 ALGO
```

---

### **Day 3-5: Algorand Client Service** ⏱️ 8 hours

#### **2.1 Create AlgorandClient Class**

**File: `src/lib/algorand/AlgorandClient.ts`**

```typescript
import algosdk from 'algosdk';

export class AlgorandClient {
  private algodClient: algosdk.Algodv2;
  private indexerClient: algosdk.Indexer;
  
  constructor(token: string, server: string, port: string, indexerServer: string) {
    this.algodClient = new algosdk.Algodv2(token, server, port);
    this.indexerClient = new algosdk.Indexer(token, indexerServer, port);
  }
  
  /**
   * Get suggested transaction parameters
   */
  async getTransactionParams() {
    return await this.algodClient.getTransactionParams().do();
  }
  
  /**
   * Mint a new Plug NFT
   * @param creatorAddress - Algorand address of Plug creator
   * @param plugName - Name of the Plug
   * @param plugDescription - Description (stored in metadata)
   * @param metadataUrl - IPFS URL for full metadata JSON
   * @returns Transaction object (to be signed by creator)
   */
  async mintPlugNFT(
    creatorAddress: string,
    plugName: string,
    plugDescription: string,
    metadataUrl: string
  ) {
    const params = await this.getTransactionParams();
    
    // Create Asset Configuration Transaction (ASA)
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
      from: creatorAddress,
      total: 1, // NFT = supply of 1
      decimals: 0,
      assetName: plugName,
      unitName: 'PLUG',
      assetURL: metadataUrl,
      manager: creatorAddress,
      reserve: creatorAddress,
      freeze: undefined,
      clawback: undefined,
      defaultFrozen: false,
      suggestedParams: params
    });
    
    return txn;
  }
  
  /**
   * Transfer Plug NFT with royalty enforcement
   * @param assetId - Algorand Asset ID (NFT)
   * @param fromAddress - Current owner
   * @param toAddress - New owner
   * @param salePrice - Sale price in USD (for royalty calculation)
   * @param royaltyPercentage - Creator royalty (e.g., 10 = 10%)
   * @returns Array of transactions (atomic transfer with royalty payment)
   */
  async transferPlugNFT(
    assetId: number,
    fromAddress: string,
    toAddress: string,
    creatorAddress: string,
    salePrice: number,
    royaltyPercentage: number
  ) {
    const params = await this.getTransactionParams();
    
    // Calculate royalty in microALGO (assuming 1 ALGO = $1 for simplicity)
    const royaltyAmount = Math.floor((salePrice * royaltyPercentage / 100) * 1_000_000);
    const platformFee = Math.floor(salePrice * 0.01 * 1_000_000); // 1% platform fee
    
    const transactions = [];
    
    // Transaction 1: NFT transfer
    transactions.push(
      algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: fromAddress,
        to: toAddress,
        amount: 1,
        assetIndex: assetId,
        suggestedParams: params
      })
    );
    
    // Transaction 2: Royalty payment to creator
    if (royaltyAmount > 0) {
      transactions.push(
        algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          from: toAddress,
          to: creatorAddress,
          amount: royaltyAmount,
          suggestedParams: params
        })
      );
    }
    
    // Transaction 3: Platform fee to treasury
    const treasuryAddress = import.meta.env.VITE_TREASURY_ADDRESS;
    transactions.push(
      algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: toAddress,
        to: treasuryAddress,
        amount: platformFee,
        suggestedParams: params
      })
    );
    
    // Group transactions atomically (all succeed or all fail)
    const groupID = algosdk.computeGroupID(transactions);
    transactions.forEach(txn => txn.group = groupID);
    
    return transactions;
  }
  
  /**
   * Get asset information (NFT details)
   */
  async getAssetInfo(assetId: number) {
    return await this.indexerClient.lookupAssetByID(assetId).do();
  }
  
  /**
   * Get assets owned by address
   */
  async getOwnedAssets(address: string) {
    return await this.indexerClient.lookupAccountByID(address).do();
  }
  
  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(txId: string, timeout: number = 10) {
    let lastRound = (await this.algodClient.status().do())['last-round'];
    while (true) {
      const pendingInfo = await this.algodClient.pendingTransactionInformation(txId).do();
      if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
        return pendingInfo;
      }
      lastRound++;
      await this.algodClient.statusAfterBlock(lastRound).do();
      if (lastRound > lastRound + timeout) {
        throw new Error('Transaction not confirmed after ' + timeout + ' rounds');
      }
    }
  }
}

/**
 * Factory function for Cloudflare Workers environment
 */
export function createAlgorandClient(env: Env) {
  return new AlgorandClient(
    env.ALGOD_TOKEN,
    env.ALGOD_SERVER || 'https://testnet-algorand.api.purestake.io/ps2',
    env.ALGOD_PORT || '',
    env.INDEXER_SERVER || 'https://testnet-algorand.api.purestake.io/idx2'
  );
}

/**
 * Factory function for browser environment (Vite)
 */
export function createAlgorandClientBrowser() {
  return new AlgorandClient(
    import.meta.env.VITE_ALGOD_TOKEN,
    import.meta.env.VITE_ALGOD_SERVER,
    import.meta.env.VITE_ALGOD_PORT || '',
    import.meta.env.VITE_INDEXER_SERVER
  );
}
```

#### **2.2 Test NFT Minting**
```bash
npm run test:algorand-mint
```

---

### **Day 6-7: Pera Wallet Integration** ⏱️ 6 hours

#### **3.1 Create PeraWalletService**

**File: `src/lib/wallet/PeraWalletService.ts`**

```typescript
import { PeraWalletConnect } from '@perawallet/connect';
import algosdk from 'algosdk';

export class PeraWalletService {
  private peraWallet: PeraWalletConnect;
  private connectedAccount: string | null = null;
  
  constructor() {
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: true,
      chainId: 416002 // Algorand Testnet
    });
    
    // Reconnect on page load if previously connected
    this.peraWallet.reconnectSession().then(accounts => {
      if (accounts.length) {
        this.connectedAccount = accounts[0];
      }
    }).catch(console.error);
  }
  
  /**
   * Connect Pera Wallet
   */
  async connect(): Promise<string> {
    try {
      const accounts = await this.peraWallet.connect();
      this.connectedAccount = accounts[0];
      return accounts[0];
    } catch (error) {
      console.error('Pera Wallet connection failed:', error);
      throw error;
    }
  }
  
  /**
   * Disconnect Pera Wallet
   */
  async disconnect() {
    await this.peraWallet.disconnect();
    this.connectedAccount = null;
  }
  
  /**
   * Sign transaction
   */
  async signTransaction(txn: algosdk.Transaction): Promise<Uint8Array> {
    if (!this.connectedAccount) {
      throw new Error('Wallet not connected');
    }
    
    const txnsToSign = [{
      txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64')
    }];
    
    const signedTxns = await this.peraWallet.signTransaction([txnsToSign]);
    return signedTxns[0];
  }
  
  /**
   * Sign multiple transactions (atomic transfer)
   */
  async signTransactions(txns: algosdk.Transaction[]): Promise<Uint8Array[]> {
    if (!this.connectedAccount) {
      throw new Error('Wallet not connected');
    }
    
    const txnsToSign = txns.map(txn => ({
      txn: Buffer.from(algosdk.encodeUnsignedTransaction(txn)).toString('base64')
    }));
    
    return await this.peraWallet.signTransaction([txnsToSign]);
  }
  
  /**
   * Get connected account
   */
  getConnectedAccount(): string | null {
    return this.connectedAccount;
  }
  
  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connectedAccount !== null;
  }
}

// Singleton instance
let peraWalletInstance: PeraWalletService | null = null;

export function getPeraWallet(): PeraWalletService {
  if (!peraWalletInstance) {
    peraWalletInstance = new PeraWalletService();
  }
  return peraWalletInstance;
}
```

---

### **Day 8-9: Database Migration** ⏱️ 4 hours

#### **4.1 Apply Plug Store Schema**

**File: `supabase/migrations/0007_plug_store.sql`**

```sql
-- Run this in Supabase SQL Editor

-- Plugs (AI Plugins for sale/rent)
CREATE TABLE plugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('voice', 'code', 'design', 'data', 'deploy', 'other')),
  icon_url TEXT,
  
  -- Pricing
  price_usd DECIMAL(10, 2),
  rental_price_monthly DECIMAL(10, 2),
  royalty_percentage INTEGER DEFAULT 10 CHECK (royalty_percentage BETWEEN 0 AND 50),
  
  -- Algorand NFT
  algorand_asset_id BIGINT UNIQUE,
  nft_metadata_url TEXT,
  
  -- Stats
  total_sales INTEGER DEFAULT 0,
  total_revenue_usd DECIMAL(12, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
  review_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'live', 'delisted')),
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plugs_creator ON plugs(creator_id);
CREATE INDEX idx_plugs_status ON plugs(status);
CREATE INDEX idx_plugs_category ON plugs(category);
CREATE INDEX idx_plugs_rating ON plugs(rating DESC);

-- Enable RLS
ALTER TABLE plugs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY plugs_read ON plugs 
  FOR SELECT 
  USING (status = 'live' OR creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY plugs_insert ON plugs 
  FOR INSERT 
  WITH CHECK (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');

CREATE POLICY plugs_update ON plugs 
  FOR UPDATE 
  USING (creator_id = current_setting('request.jwt.claims', true)::json->>'sub');
```

#### **4.2 Test Database Access**
```bash
npm run test:db-connection
```

---

### **Day 10: Testing & Documentation** ⏱️ 4 hours

#### **5.1 Create Test Script**

**File: `scripts/test-phase1.ts`**

```typescript
import { createAlgorandClientBrowser } from '../src/lib/algorand/AlgorandClient';
import { getPeraWallet } from '../src/lib/wallet/PeraWalletService';

async function testPhase1() {
  console.log('🧪 Testing Phase 1 Implementation...\n');
  
  // Test 1: Algorand Connection
  console.log('Test 1: Algorand Connection');
  const algoClient = createAlgorandClientBrowser();
  const params = await algoClient.getTransactionParams();
  console.log('✅ Connected to Algorand testnet\n');
  
  // Test 2: Pera Wallet
  console.log('Test 2: Pera Wallet Connection');
  const wallet = getPeraWallet();
  console.log('✅ Pera Wallet service initialized\n');
  
  // Test 3: Database Access
  console.log('Test 3: Database Access');
  const response = await fetch('/api/plugs/test-connection');
  if (response.ok) {
    console.log('✅ Database connection working\n');
  }
  
  console.log('🎉 All Phase 1 tests passed!');
}

testPhase1().catch(console.error);
```

---

## 🚀 **QUICK START COMMANDS**

```bash
# Day 1-2: Setup
npm install algosdk @perawallet/connect
node scripts/test-algorand-connection.js

# Day 3-5: Algorand Client
npm run test:algorand-mint

# Day 6-7: Wallet Integration
npm run dev
# Open http://localhost:3002/test-wallet

# Day 8-9: Database
supabase db push
# Or apply via Supabase Dashboard SQL Editor

# Day 10: Full Test
npm run test:phase1
```

---

## ✅ **SUCCESS CRITERIA**

- [ ] Algorand testnet connection works
- [ ] Can mint test NFT successfully
- [ ] Pera Wallet connects and signs transactions
- [ ] Database schema applied
- [ ] Plug creation flow works end-to-end
- [ ] SuperAdmin can approve/reject Plugs

---

## 🐛 **Common Issues & Solutions**

### Issue: "Cannot connect to Algorand"
**Solution:** Check PureStake API key is valid, verify .env.local loaded

### Issue: "Pera Wallet not found"
**Solution:** Install Pera Wallet browser extension, switch to testnet

### Issue: "Transaction not confirmed"
**Solution:** Ensure account has testnet ALGO (use faucet)

---

## 📞 **READY TO START?**

Run this to begin:
```bash
npm run setup:phase1
```

This will:
1. Install dependencies
2. Create environment files
3. Test connections
4. Generate setup report

**Let's build the Creator Economy! 🚀**
