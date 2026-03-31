// Lazy-load Stellar SDK to avoid blocking the initial React render.
// The SDK is heavy and needs Buffer polyfill to be in place first.

let _sdk = null;
let _server = null;

async function getSdk() {
  if (!_sdk) {
    _sdk = await import('@stellar/stellar-sdk');
  }
  return _sdk;
}

async function getServer() {
  if (!_server) {
    const sdk = await getSdk();
    _server = new sdk.rpc.Server(SOROBAN_RPC_URL);
  }
  return _server;
}

// ── Contract Configuration ───────────────────────────
// NOTE: You must update CONTRACT_ID when you re-deploy the updated contract logic!
export const CONTRACT_ID = 'CBDQAYMVYRQ2K3YUN5U7GXBRZ6C63BUDFM5O5O6HVWDRN26DL4XOZEAR';
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

async function getHorizonServer() {
  const sdk = await getSdk();
  return new sdk.Horizon.Server(HORIZON_URL);
}

/**
 * Fetch all notes from the NoteKeeper contract.
 * Calls `get_notes` (read-only, no auth needed).
 */
export async function fetchNotes() {
  const StellarSdk = await getSdk();
  const server = await getServer();
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const account = new StellarSdk.Account(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0'
  );

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call('get_all_notes'))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error(simResult.error ?? 'Simulation failed');
  }

  const resultVal = simResult.result?.retval;
  if (!resultVal) return [];

  const notes = [];
  const rawVec = StellarSdk.scValToNative(resultVal);

  if (Array.isArray(rawVec)) {
    for (let i = 0; i < rawVec.length; i++) {
      const item = rawVec[i];
      // Note: id might be a BigInt (u64), owner is Address object/string
      notes.push({
        id: (item.id !== undefined && item.id !== null) ? item.id.toString() : `local-${i}`,
        owner: item.owner?.toString() ?? 'Unknown',
        content: item.content ?? '',
      });
    }
  }

  return notes;
}

// Generic transcation submission helper
async function submitTransaction(publicKey, operationBuilder) {
  const StellarSdk = await getSdk();
  const server = await getServer();
  const { signTransaction } = await import('@stellar/freighter-api');

  const account = await server.getAccount(publicKey);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(operationBuilder)
    .setTimeout(60)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error(simResult.error ?? 'Simulation failed');
  }

  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();

  const signedResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  const signedXdr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);

  const sendResult = await server.sendTransaction(signedTx);
  if (sendResult.status === 'ERROR') throw new Error('Transaction submission failed');

  let getResult;
  let attempts = 0;
  do {
    await new Promise((r) => setTimeout(r, 2000));
    getResult = await server.getTransaction(sendResult.hash);
    attempts++;
  } while (getResult.status === 'NOT_FOUND' && attempts < 30);

  if (getResult.status === 'SUCCESS') return { success: true, hash: sendResult.hash };
  throw new Error(`Transaction failed with status: ${getResult.status}`);
}

/** Submit a new note */
export async function submitNote(publicKey, content) {
  const StellarSdk = await getSdk();
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  return submitTransaction(publicKey, contract.call(
    'add_note',
    StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
    StellarSdk.nativeToScVal(content, { type: 'string' })
  ));
}

/** Update an existing note */
export async function updateNote(publicKey, noteId, content) {
  const StellarSdk = await getSdk();
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  return submitTransaction(publicKey, contract.call(
    'update_note',
    StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
    StellarSdk.nativeToScVal(Number(noteId), { type: 'u64' }),
    StellarSdk.nativeToScVal(content, { type: 'string' })
  ));
}

/** Delete an existing note */
export async function deleteNote(publicKey, noteId) {
  const StellarSdk = await getSdk();
  const contract = new StellarSdk.Contract(CONTRACT_ID);
  return submitTransaction(publicKey, contract.call(
    'delete_note',
    StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
    StellarSdk.nativeToScVal(Number(noteId), { type: 'u64' })
  ));
}

/** Fetch XLM balance for a given address */
export async function fetchBalance(publicKey) {
  try {
    const server = await getHorizonServer();
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(b => b.asset_type === 'native');
    return nativeBalance ? nativeBalance.balance : '0';
  } catch (err) {
    console.error('Error fetching balance:', err);
    return '0';
  }
}

/** Send XLM from one address to another */
export async function sendXLM(publicKey, destination, amount) {
  const StellarSdk = await getSdk();
  const server = await getHorizonServer();
  const { signTransaction } = await import('@stellar/freighter-api');

  const account = await server.loadAccount(publicKey);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(StellarSdk.Operation.payment({
      destination,
      asset: StellarSdk.Asset.native(),
      amount: amount.toString(),
    }))
    .setTimeout(60)
    .build();

  const signedResult = await signTransaction(tx.toXDR(), {
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  const signedXdr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);

  const result = await server.submitTransaction(signedTx);
  return {
    success: true,
    hash: result.hash,
    ledger: result.ledger
  };
}
