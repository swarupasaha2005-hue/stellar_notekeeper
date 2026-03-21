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
export const CONTRACT_ID = 'CCHMIRJQDW6HJPEZ3TUORFANL3M5HWSKVYVMJPBAXWTX3OZS3PKT6Q4B';
export const SOROBAN_RPC_URL = 'https://soroban-testnet.stellar.org';

/**
 * Fetch all notes from the NoteKeeper contract.
 * Calls `get_notes` (read-only, no auth needed).
 */
export async function fetchNotes() {
  const StellarSdk = await getSdk();
  const server = await getServer();
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  // Use a dummy source account to simulate the read-only call
  const account = new StellarSdk.Account(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    '0'
  );

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(contract.call('get_notes'))
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error(simResult.error ?? 'Simulation failed');
  }

  // Parse the result — returns Vec<Note> where Note = { owner, content }
  const resultVal = simResult.result?.retval;
  if (!resultVal) return [];

  const notes = [];
  const rawVec = StellarSdk.scValToNative(resultVal);

  if (Array.isArray(rawVec)) {
    for (const item of rawVec) {
      notes.push({
        owner: item.owner ?? item.owner?.toString() ?? 'Unknown',
        content: item.content ?? '',
      });
    }
  }

  return notes;
}

/**
 * Submit a new note to the NoteKeeper contract.
 * Calls `add_note(user: Address, content: String)`.
 */
export async function submitNote(publicKey, content) {
  const StellarSdk = await getSdk();
  const server = await getServer();
  const { signTransaction } = await import('@stellar/freighter-api');

  const account = await server.getAccount(publicKey);
  const contract = new StellarSdk.Contract(CONTRACT_ID);

  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: StellarSdk.BASE_FEE,
    networkPassphrase: StellarSdk.Networks.TESTNET,
  })
    .addOperation(
      contract.call(
        'add_note',
        StellarSdk.nativeToScVal(publicKey, { type: 'address' }),
        StellarSdk.nativeToScVal(content, { type: 'string' })
      )
    )
    .setTimeout(60)
    .build();

  // Simulate to get the prepared (footprinted) tx
  const simResult = await server.simulateTransaction(tx);

  if (StellarSdk.rpc.Api.isSimulationError(simResult)) {
    throw new Error(simResult.error ?? 'Simulation failed');
  }

  const preparedTx = StellarSdk.rpc.assembleTransaction(tx, simResult).build();

  // Sign with Freighter
  const signedResult = await signTransaction(preparedTx.toXDR(), {
    networkPassphrase: StellarSdk.Networks.TESTNET,
  });

  const signedXdr = typeof signedResult === 'string' ? signedResult : signedResult.signedTxXdr;
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, StellarSdk.Networks.TESTNET);

  // Submit and poll for completion
  const sendResult = await server.sendTransaction(signedTx);

  if (sendResult.status === 'ERROR') {
    throw new Error('Transaction submission failed');
  }

  // Poll until complete
  let getResult;
  let attempts = 0;
  const maxAttempts = 30;

  do {
    await new Promise((r) => setTimeout(r, 2000));
    getResult = await server.getTransaction(sendResult.hash);
    attempts++;
  } while (getResult.status === 'NOT_FOUND' && attempts < maxAttempts);

  if (getResult.status === 'SUCCESS') {
    return { success: true, hash: sendResult.hash };
  }

  throw new Error(`Transaction failed with status: ${getResult.status}`);
}
