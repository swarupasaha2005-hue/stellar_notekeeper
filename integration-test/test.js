import { Contract, rpc, Networks, Keypair, Asset, TransactionBuilder, xdr } from '@stellar/stellar-sdk';

// Integration test for NoteKeeper smart contract
// To run this test:
// 1. Ensure you have the NoteKeeper contract compiled and deployed
// 2. Set the deployed CONTRACT_ID and a funded SECRET_KEY below
// 3. Run `node integration-test.js`

const CONTRACT_ID = process.env.CONTRACT_ID || 'CCHMIRJQDW6HJPEZ3TUORFANL3M5HWSKVYVMJPBAXWTX3OZS3PKT6Q4B';
const SECRET_KEY = process.env.SECRET_KEY; // Replace with a funded testnet secret key

const RPC_URL = 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

async function main() {
    if (!SECRET_KEY) {
        console.error('Please provide a SECRET_KEY environment variable to run the integration test.');
        console.log('e.g., SECRET_KEY=S... node integration-test.js');
        process.exit(1);
    }

    const keypair = Keypair.fromSecret(SECRET_KEY);
    const server = new rpc.Server(RPC_URL);
    const contract = new Contract(CONTRACT_ID);

    console.log('Integrating with NoteKeeper contract on Testnet...');
    console.log('Test Account:', keypair.publicKey());

    // 1. Fetch account details to get the current sequence number
    const account = await server.getAccount(keypair.publicKey());

    console.log('\n--- Adding a new note ---');
    const noteContent = `Integration Test Note at ${new Date().toISOString()}`;
    
    // Construct the contract invocation for add_note
    const addNoteCall = contract.call(
        'add_note',
        xdr.ScVal.scvAddress(xdr.ScAddress.scAddressTypeAccountId(keypair.xdrPublicKey())),
        xdr.ScVal.scvString(noteContent)
    );

    // Build the transaction
    const tx = new TransactionBuilder(account, {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE
    })
    .addOperation(addNoteCall)
    .setTimeout(30)
    .build();

    // Prepare for simulation/authorization
    const preparedTx = await server.prepareTransaction(tx);
    preparedTx.sign(keypair);

    // Submit transaction
    console.log(`Submitting add_note transaction with content: "${noteContent}"`);
    try {
        const sendResponse = await server.sendTransaction(preparedTx);
        console.log('Transaction hash:', sendResponse.hash);
        
        // Poll for status
        let txStatus = await server.getTransaction(sendResponse.hash);
        while (txStatus.status === 'PENDING') {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            txStatus = await server.getTransaction(sendResponse.hash);
        }

        if (txStatus.status === 'SUCCESS') {
            console.log('Successfully added note to NoteKeeper!');
        } else {
            console.error('Transaction Failed:', txStatus);
            return;
        }
    } catch (e) {
        console.error('Error submitting transaction:', e);
        return;
    }

    console.log('\n--- Retrieving notes ---');
    // Call get_notes
    const getNotesCall = contract.call('get_notes');
    const getTx = new TransactionBuilder(await server.getAccount(keypair.publicKey()), {
        fee: '100000',
        networkPassphrase: NETWORK_PASSPHRASE
    })
    .addOperation(getNotesCall)
    .setTimeout(30)
    .build();

    try {
        const simulatedGet = await server.simulateTransaction(getTx);
        if (simulatedGet.results && simulatedGet.results.length > 0) {
            const resultVal = simulatedGet.results[0].xdr;
            console.log('Notes retrieved! Raw result:', resultVal);
            // Ideally, we parse the array into an array of Strings or Note structs here.
        } else {
            console.log('No notes found or error in retrieval.');
        }
    } catch (e) {
        console.error('Error retrieving notes:', e);
    }

    console.log('\nIntegration test completed.');
}

main().catch(console.error);
