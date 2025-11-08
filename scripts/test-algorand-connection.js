/**
 * Simple Algorand connection test script
 * Tests PureStake API connection to Algorand testnet
 */

import algosdk from 'algosdk';

// Load configuration
const algodToken = process.env.VITE_ALGOD_TOKEN || 'your_api_key_here';
const algodServer = 'https://testnet-algorand.api.purestake.io/ps2';
const algodPort = '';

async function testConnection() {
  console.log('🔗 Testing Algorand Testnet Connection...\n');

  try {
    // Create Algod client
    const algodClient = new algosdk.Algodv2(
      { 'X-API-Key': algodToken },
      algodServer,
      algodPort
    );

    console.log('📡 Connecting to:', algodServer);
    console.log('🔑 Using API key:', algodToken.substring(0, 10) + '...\n');

    // Get node status
    const status = await algodClient.status().do();
    console.log('✅ Connected successfully!\n');
    console.log('Network Details:');
    console.log('  Last Round:', status['last-round']);
    console.log('  Time Since Last Round:', status['time-since-last-round'], 'ms');
    console.log('  Catchup Time:', status['catchup-time'], 'ms');
    console.log('  Last Version:', status['last-version']);

    // Get transaction parameters
    const params = await algodClient.getTransactionParams().do();
    console.log('\nTransaction Parameters:');
    console.log('  Genesis ID:', params.genesisID);
    console.log('  First Round:', params.firstRound);
    console.log('  Last Round:', params.lastRound);
    console.log('  Fee:', params.fee, 'microAlgos');

    console.log('\n🎉 Connection test successful!');
    console.log('\n📝 Next Steps:');
    console.log('  1. Update .env.local with your PureStake API key');
    console.log('  2. Create Algorand testnet account: https://testnet.algoexplorer.io/dispenser');
    console.log('  3. Add treasury address to .env.local');
    console.log('  4. Run: node scripts/test-phase1.js');

    return true;
  } catch (error) {
    console.error('❌ Connection failed!\n');
    console.error('Error:', error.message);

    if (error.message.includes('API key')) {
      console.error('\n💡 Tip: Get a PureStake API key at https://developer.purestake.io/');
      console.error('   Then set VITE_ALGOD_TOKEN in .env.local');
    }

    return false;
  }
}

// Run test
testConnection().then((success) => {
  process.exit(success ? 0 : 1);
});
