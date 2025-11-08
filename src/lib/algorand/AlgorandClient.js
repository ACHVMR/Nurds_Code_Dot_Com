import algosdk from 'algosdk';

/**
 * AlgorandClient - Handles all Algorand blockchain interactions
 * Supports both browser and Cloudflare Workers environments
 */
export class AlgorandClient {
  constructor(algodClient, indexerClient, treasuryAddress) {
    this.algodClient = algodClient;
    this.indexerClient = indexerClient;
    this.treasuryAddress = treasuryAddress;
  }

  /**
   * Get suggested transaction parameters
   */
  async getTransactionParams() {
    try {
      const params = await this.algodClient.getTransactionParams().do();
      return params;
    } catch (error) {
      console.error('❌ Failed to get transaction params:', error);
      throw new Error(`Failed to get transaction params: ${error.message}`);
    }
  }

  /**
   * Mint a new Plug NFT (Algorand Standard Asset with total=1)
   * @param {string} creatorAddress - Creator's Algorand address
   * @param {Object} plugData - Plug metadata
   * @param {string} plugData.name - Plug name (max 32 bytes)
   * @param {string} plugData.unitName - Unit name (max 8 bytes, e.g., 'PLUG')
   * @param {string} plugData.assetURL - URL to plug metadata JSON
   * @param {string} plugData.assetMetadataHash - Optional 32-byte hash of metadata
   * @returns {Object} Unsigned transaction
   */
  async mintPlugNFT(creatorAddress, plugData) {
    try {
      console.log('🎨 Minting Plug NFT:', { creatorAddress, name: plugData.name });

      const params = await this.getTransactionParams();

      // Create NFT (total=1, decimals=0)
      const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: creatorAddress,
        total: 1, // NFT must have total supply of 1
        decimals: 0, // NFTs are not divisible
        assetName: plugData.name.substring(0, 32), // Max 32 bytes
        unitName: (plugData.unitName || 'PLUG').substring(0, 8), // Max 8 bytes
        assetURL: plugData.assetURL || '',
        assetMetadataHash: plugData.assetMetadataHash || undefined,
        defaultFrozen: false,
        manager: creatorAddress, // Can change manager, reserve, freeze, clawback
        reserve: creatorAddress, // Receives unclaimed assets
        freeze: undefined, // Not needed for Plugs
        clawback: undefined, // Not needed for Plugs
        suggestedParams: params,
      });

      console.log('✅ Plug NFT transaction created:', { assetName: plugData.name });
      return txn;
    } catch (error) {
      console.error('❌ Failed to mint Plug NFT:', error);
      throw new Error(`Failed to mint Plug NFT: ${error.message}`);
    }
  }

  /**
   * Transfer Plug NFT with royalty enforcement (atomic transfer)
   * Creates 3 grouped transactions:
   * 1. NFT transfer from seller to buyer
   * 2. Royalty payment from buyer to creator
   * 3. Platform fee from buyer to treasury
   * 
   * @param {string} sellerAddress - Current NFT owner
   * @param {string} buyerAddress - New NFT owner
   * @param {string} creatorAddress - Original creator (receives royalty)
   * @param {number} assetId - Algorand Asset ID
   * @param {number} priceUSD - Sale price in USD
   * @param {number} royaltyPercent - Royalty percentage (e.g., 10 for 10%)
   * @param {number} platformFeePercent - Platform fee percentage (e.g., 2.5 for 2.5%)
   * @returns {Array} Array of 3 unsigned transactions
   */
  async transferPlugNFT(
    sellerAddress,
    buyerAddress,
    creatorAddress,
    assetId,
    priceUSD,
    royaltyPercent = 10,
    platformFeePercent = 2.5
  ) {
    try {
      console.log('🔄 Creating atomic transfer with royalty:', {
        assetId,
        priceUSD,
        royaltyPercent,
        platformFeePercent,
      });

      const params = await this.getTransactionParams();

      // Calculate fees in microAlgos (1 ALGO = 1,000,000 microAlgos)
      // Note: In production, use real-time ALGO/USD price
      const algoPrice = 0.2; // Placeholder: $0.20 per ALGO
      const totalAlgos = priceUSD / algoPrice;
      const microAlgos = Math.floor(totalAlgos * 1000000);

      const royaltyMicroAlgos = Math.floor((microAlgos * royaltyPercent) / 100);
      const platformFeeMicroAlgos = Math.floor((microAlgos * platformFeePercent) / 100);
      const sellerMicroAlgos = microAlgos - royaltyMicroAlgos - platformFeeMicroAlgos;

      // Transaction 1: NFT transfer (buyer → seller)
      const nftTransferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: sellerAddress,
        to: buyerAddress,
        assetIndex: assetId,
        amount: 1, // NFT transfer
        suggestedParams: params,
      });

      // Transaction 2: Payment to seller
      const sellerPaymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyerAddress,
        to: sellerAddress,
        amount: sellerMicroAlgos,
        suggestedParams: params,
      });

      // Transaction 3: Royalty payment to creator
      const royaltyPaymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyerAddress,
        to: creatorAddress,
        amount: royaltyMicroAlgos,
        suggestedParams: params,
      });

      // Transaction 4: Platform fee to treasury
      const platformFeeTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: buyerAddress,
        to: this.treasuryAddress,
        amount: platformFeeMicroAlgos,
        suggestedParams: params,
      });

      // Group transactions atomically
      const txnGroup = [nftTransferTxn, sellerPaymentTxn, royaltyPaymentTxn, platformFeeTxn];
      const groupID = algosdk.computeGroupID(txnGroup);

      txnGroup.forEach((txn) => {
        txn.group = groupID;
      });

      console.log('✅ Atomic transfer group created:', {
        transactions: 4,
        sellerGets: sellerMicroAlgos,
        royalty: royaltyMicroAlgos,
        platformFee: platformFeeMicroAlgos,
      });

      return txnGroup;
    } catch (error) {
      console.error('❌ Failed to create transfer:', error);
      throw new Error(`Failed to create transfer: ${error.message}`);
    }
  }

  /**
   * Get asset information
   */
  async getAssetInfo(assetId) {
    try {
      const assetInfo = await this.algodClient.getAssetByID(assetId).do();
      return assetInfo;
    } catch (error) {
      console.error('❌ Failed to get asset info:', error);
      throw new Error(`Failed to get asset info: ${error.message}`);
    }
  }

  /**
   * Get all assets owned by an address
   */
  async getOwnedAssets(address) {
    try {
      const accountInfo = await this.algodClient.accountInformation(address).do();
      return accountInfo.assets || [];
    } catch (error) {
      console.error('❌ Failed to get owned assets:', error);
      throw new Error(`Failed to get owned assets: ${error.message}`);
    }
  }

  /**
   * Wait for transaction confirmation
   * @param {string} txId - Transaction ID
   * @param {number} timeout - Timeout in rounds (default: 4)
   */
  async waitForConfirmation(txId, timeout = 4) {
    try {
      console.log('⏳ Waiting for confirmation:', txId);

      const status = await this.algodClient.status().do();
      let lastRound = status['last-round'];
      const timeoutRound = lastRound + timeout;

      while (lastRound < timeoutRound) {
        const pendingInfo = await this.algodClient
          .pendingTransactionInformation(txId)
          .do();

        if (pendingInfo['confirmed-round'] !== null && pendingInfo['confirmed-round'] > 0) {
          console.log('✅ Transaction confirmed in round:', pendingInfo['confirmed-round']);
          return pendingInfo;
        }

        if (pendingInfo['pool-error'] != null && pendingInfo['pool-error'].length > 0) {
          throw new Error(`Transaction error: ${pendingInfo['pool-error']}`);
        }

        lastRound++;
        await this.algodClient.statusAfterBlock(lastRound).do();
      }

      throw new Error('Transaction not confirmed after timeout');
    } catch (error) {
      console.error('❌ Transaction confirmation failed:', error);
      throw new Error(`Transaction confirmation failed: ${error.message}`);
    }
  }
}

/**
 * Factory function for browser environment
 */
export function createAlgorandClientBrowser(config) {
  const algodClient = new algosdk.Algodv2(
    { 'X-API-Key': config.algodToken },
    config.algodServer,
    config.algodPort || ''
  );

  const indexerClient = new algosdk.Indexer(
    { 'X-API-Key': config.algodToken },
    config.indexerServer,
    ''
  );

  return new AlgorandClient(algodClient, indexerClient, config.treasuryAddress);
}

/**
 * Factory function for Cloudflare Workers environment
 */
export function createAlgorandClient(env) {
  const algodClient = new algosdk.Algodv2(
    { 'X-API-Key': env.ALGOD_TOKEN },
    env.ALGOD_SERVER,
    env.ALGOD_PORT || ''
  );

  const indexerClient = new algosdk.Indexer(
    { 'X-API-Key': env.ALGOD_TOKEN },
    env.INDEXER_SERVER,
    ''
  );

  return new AlgorandClient(algodClient, indexerClient, env.TREASURY_ADDRESS);
}

export default AlgorandClient;
