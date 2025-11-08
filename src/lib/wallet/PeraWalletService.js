import { PeraWalletConnect } from '@perawallet/connect';

/**
 * PeraWalletService - Handles Pera Wallet integration
 * Singleton pattern to ensure only one wallet instance
 */
export class PeraWalletService {
  constructor() {
    this.peraWallet = new PeraWalletConnect({
      shouldShowSignTxnToast: true,
      chainId: 416002, // Algorand Testnet
    });

    this.accountAddress = null;

    // Try to reconnect to existing session
    this.peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          this.accountAddress = accounts[0];
          console.log('✅ Reconnected to Pera Wallet:', this.accountAddress);
        }
      })
      .catch((error) => {
        console.log('ℹ️ No existing wallet session:', error.message);
      });
  }

  /**
   * Connect to Pera Wallet
   * @returns {Promise<string>} Connected account address
   */
  async connect() {
    try {
      console.log('🔗 Connecting to Pera Wallet...');

      const accounts = await this.peraWallet.connect();

      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }

      this.accountAddress = accounts[0];
      console.log('✅ Connected to Pera Wallet:', this.accountAddress);

      return this.accountAddress;
    } catch (error) {
      console.error('❌ Failed to connect to Pera Wallet:', error);
      throw new Error(`Failed to connect to Pera Wallet: ${error.message}`);
    }
  }

  /**
   * Disconnect from Pera Wallet
   */
  async disconnect() {
    try {
      await this.peraWallet.disconnect();
      this.accountAddress = null;
      console.log('✅ Disconnected from Pera Wallet');
    } catch (error) {
      console.error('❌ Failed to disconnect:', error);
      throw new Error(`Failed to disconnect: ${error.message}`);
    }
  }

  /**
   * Sign a single transaction
   * @param {Object} txn - Unsigned transaction
   * @returns {Promise<Uint8Array>} Signed transaction
   */
  async signTransaction(txn) {
    try {
      if (!this.accountAddress) {
        throw new Error('Wallet not connected');
      }

      console.log('✍️ Signing transaction...');

      // Encode transaction to base64
      const txnBase64 = Buffer.from(txn.toByte()).toString('base64');

      const signedTxns = await this.peraWallet.signTransaction([[{ txn: txnBase64 }]]);

      console.log('✅ Transaction signed');
      return signedTxns[0];
    } catch (error) {
      console.error('❌ Failed to sign transaction:', error);
      throw new Error(`Failed to sign transaction: ${error.message}`);
    }
  }

  /**
   * Sign multiple transactions (for atomic transfers)
   * @param {Array} txns - Array of unsigned transactions
   * @returns {Promise<Array>} Array of signed transactions
   */
  async signTransactions(txns) {
    try {
      if (!this.accountAddress) {
        throw new Error('Wallet not connected');
      }

      console.log('✍️ Signing atomic transfer group...', { count: txns.length });

      // Convert transactions to base64
      const txnsToSign = txns.map((txn) => ({
        txn: Buffer.from(txn.toByte()).toString('base64'),
      }));

      const signedTxns = await this.peraWallet.signTransaction([txnsToSign]);

      console.log('✅ All transactions signed');
      return signedTxns;
    } catch (error) {
      console.error('❌ Failed to sign transactions:', error);
      throw new Error(`Failed to sign transactions: ${error.message}`);
    }
  }

  /**
   * Get connected account address
   * @returns {string|null} Account address or null if not connected
   */
  getConnectedAccount() {
    return this.accountAddress;
  }

  /**
   * Check if wallet is connected
   * @returns {boolean}
   */
  isConnected() {
    return this.accountAddress !== null;
  }
}

// Singleton instance
let peraWalletInstance = null;

/**
 * Get or create PeraWalletService singleton
 * @returns {PeraWalletService}
 */
export function getPeraWallet() {
  if (!peraWalletInstance) {
    peraWalletInstance = new PeraWalletService();
  }
  return peraWalletInstance;
}

export default PeraWalletService;
