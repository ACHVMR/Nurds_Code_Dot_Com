import algosdk from 'algosdk';

async function testAlgoKit() {
  console.log('🚀 Testing AlgoKit LocalNet connection...\n');
  
  try {
    // Connect to LocalNet (running on your machine - no API key needed!)
    const algodToken = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
    const algodServer = 'http://localhost';
    const algodPort = 4001;
    
    const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
    
    // Check connection
    const status = await algodClient.status().do();
    console.log('✅ Connected to AlgoKit LocalNet!');
    console.log('📊 Genesis ID:', status['genesis-id'] || 'dockernet-v1');
    console.log('📦 Latest round:', status['last-round'] || '0');
    
    // Get version info
    const versions = await algodClient.versionsCheck().do();
    console.log('🏷️  Algod version:', versions.versions[0]);
    
    // Create a test account
    console.log('\n🔑 Creating test account...');
    const account = algosdk.generateAccount();
    
    // Fix: algosdk 3.5.2 returns Address object, use toString() to convert
    const accountAddress = account.addr.toString();
    
    console.log('Address:', accountAddress);
    console.log('Mnemonic (save this!):', algosdk.secretKeyToMnemonic(account.sk));
    
    // Use LocalNet's pre-funded account to fund our new account
    const dispenserMnemonic = 'enemy beef excess mystery artwork mesh priority matter urge key never choice eight canal recipe huge oyster embody penalty swarm eager tragic barely ability dynamic';
    const dispenser = algosdk.mnemonicToSecretKey(dispenserMnemonic);
    
    // Fix: dispenser.addr is also Address object, use toString()
    const dispenserAddress = dispenser.addr.toString();
    
    console.log('\n💰 Funding account from LocalNet dispenser...');
    console.log('🏦 Dispenser address:', dispenserAddress);
    console.log('🎯 New account address:', accountAddress);
    
    const params = await algodClient.getTransactionParams().do();
    console.log('✅ Got transaction params');
    
    console.log('\n📝 Creating transaction...');
    
    // Use the correct parameter names: sender and receiver, not from and to
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: dispenserAddress,
      receiver: accountAddress,
      amount: 10_000_000, // 10 ALGO (in microAlgos)
      suggestedParams: params
    });
    
    console.log('✅ Transaction created');
    
    // Sign the transaction
    const signedTxn = txn.signTxn(dispenser.sk);
    
    // Send the transaction
    await algodClient.sendRawTransaction(signedTxn).do();
    
    // Get txId from the transaction object itself
    const txId = txn.txID().toString();
    console.log('📤 Transaction sent! ID:', txId);
    console.log('⏳ Waiting for confirmation...');
    
    await algosdk.waitForConfirmation(algodClient, txId, 4);
    console.log('✅ Transaction confirmed!');
    
    // Check new account balance
    const accountInfo = await algodClient.accountInformation(accountAddress).do();
    // Convert BigInt to Number for division
    const balanceInMicroAlgos = Number(accountInfo.amount);
    console.log('\n💵 New account balance:', balanceInMicroAlgos / 1_000_000, 'ALGO');
    
    console.log('\n✨ AlgoKit LocalNet is working perfectly!');
    console.log('\n📋 Next steps:');
    console.log('1. View your transaction: https://explore.algokit.io/localnet/transaction/' + txId);
    console.log('2. View your account: https://explore.algokit.io/localnet/address/' + accountAddress);
    console.log('3. Open explorer: algokit explore');
    console.log('4. Save the mnemonic above if you want to reuse this account');
    console.log('5. Start building your Algorand dApp!');
    
    return { success: true, account };
    
  } catch (error) {
    console.error('\n❌ Error connecting to LocalNet!');
    console.error('\n📋 Troubleshooting:');
    console.error('1. Make sure Docker Desktop is running');
    console.error('2. Start LocalNet: algokit localnet start');
    console.error('3. Check status: algokit localnet status');
    console.error('\nError details:', error.message);
    return { success: false, error: error.message };
  }
}

// Run the test
testAlgoKit().then(() => process.exit(0)).catch(() => process.exit(1));
