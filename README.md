# 📝 NoteKeeper — Soroban Smart Contract

## Project Description

Live Demo: https://stellarnotekeeper.vercel.app/
Demo Video: https://youtu.be/d-rnebXK6Vw?si=Ph7dAOWj4U60XxqH


**NoteKeeper** is a simple decentralized note storage smart contract built using **Soroban on the Stellar blockchain**.
The project demonstrates how users can store and retrieve notes directly on-chain using Soroban smart contracts written in Rust.

Each note is linked to the wallet address that created it, ensuring that only authenticated users can add notes.

This project serves as a basic example for learning:

* Soroban smart contract development
* Blockchain-based storage
* Authentication with Stellar addresses
* Rust-based smart contract design

---

![notebook preview](explorer.jpg)

## What It Does

The **NoteKeeper** smart contract allows users to store short notes permanently on the blockchain.

Users can:

1. Add new notes
2. Store notes securely on-chain
3. Retrieve all stored notes from the contract
4. Update notes
5. Delete notes
6. Real-time clock

The contract uses Soroban’s instance storage to persist data across transactions.

---

## Features

### 🔐 User Authentication

Only authenticated wallet addresses can add notes using Soroban’s `require_auth()` security mechanism.

### 📝 On-Chain Note Storage

Notes are stored directly in the smart contract storage on the Stellar blockchain.

### 📦 Structured Data

Each note is stored using a structured data type containing:

* Owner address
* Note content

### ⚡ Lightweight & Efficient

The contract is minimal and optimized for Soroban's execution environment.

### 🧱 Rust + Soroban SDK

Built using Rust and the Soroban SDK for secure and efficient smart contract execution.

---

## Smart Contract Functions

### `add_note`

Adds a new note to the blockchain.

**Parameters**

* `user: Address` → Wallet address of the user creating the note
* `content: String` → The note text

**Behavior**

* Verifies the user's authorization
* Creates a new note
* Stores the note in contract storage

---

### `get_notes`

Returns all notes stored in the contract.

**Returns**

* `Vec<Note>` containing all stored notes

Each note contains:

```rust
pub struct Note {
    pub id: u64,
    pub owner: Address,
    pub content: String,
}
```

---

### `update_note`

Updates the content of an existing note. Only the owner of the note can update it.

**Parameters**

* `user: Address` → Wallet address of the user (must be the owner)
* `note_id: u64` → ID of the note to update
* `new_content: String` → The new note text

---

### `delete_note`

Deletes an existing note. Only the owner of the note can delete it.

**Parameters**

* `user: Address` → Wallet address of the user (must be the owner)
* `note_id: u64` → ID of the note to delete

---

## Running Tests

The project includes a comprehensive test suite in Rust. To run the tests, ensure you have Rust and the Soroban CLI installed, then run:

```bash
cd contracts/notekeeper
cargo test
```

The tests cover:
1. Adding and retrieving notes.
2. Updating existing notes.
3. Deleting notes.
4. Unauthorized access prevention.

## 📸 Demo Preview
![App Screenshot](./screenshots/demo.png)

## Project Structure

```
notekeeper/
│
├── src/
│   ├── lib.rs        # Soroban smart contract
│   └── test.rs       # Contract unit tests
│
├── Cargo.toml        # Rust dependencies
│
└── README.md         # Project documentation
```

---

## Tech Stack

* **Stellar Soroban**
* **Rust**
* **Soroban SDK**
* **WebAssembly (WASM)**

---

## Build the Contract

```
stellar contract build
```

---

## Deploy the Contract

```
stellar contract deploy \
--wasm target/wasm32-unknown-unknown/release/notekeeper.wasm \
--source <ACCOUNT_NAME> \
--network testnet
```

---

## Example Contract Invocation

Add a note:

```
stellar contract invoke \
--id <CONTRACT_ID> \
--source <ACCOUNT_NAME> \
--network testnet \
-- add_note \
--user <WALLET_ADDRESS> \
--content "Hello Soroban"
```

Retrieve notes:

```
stellar contract invoke \
--id <CONTRACT_ID> \
--source <ACCOUNT_NAME> \
--network testnet \
-- get_notes
```

---

## Deployed Smart Contract Link

```
https://lab.stellar.org/r/testnet/contract/CDB4KUPVJFG4NTSW6XUXKNK33BCYPOA7URO23R5U4PTP5XL5YH7MZDX2
```

Replace this with your deployed contract explorer link.

Example:

```
https://stellar.expert/explorer/testnet/contract/XXXXXXXXXXXXXXXX
```

![Alt text](./explorer.jpg)

---

## 🎨 UI Enhancements (Retro Web3 OS)

The frontend has been completely overhauled into an interactive, draggable **Retro OS Widget Desktop**:
* **Draggable Window Widgets**: Every UI component (Notes, Wallet, Player) is a movable window.
* **Animated Grid Background**: Floating pastel clouds and city trees scrolling in the background.
* **Pixel Cursor**: Custom layered SVG cursor matching the kawaii aesthetic.
* **Interactive Lofi Music Player**: Built-in Web Audio API synthesizer that plays smooth chords.
* **Dynamic Real-time Clock**: A `sys_clock.exe` widget that updates the time actively.
* **Day/Night Theme Toggle**: Native CSS variables mapping to a sun/moon switch for dark mode.
* **Global Retro Click Sounds**: Sonic feedback for every window interaction.

---

## Future Improvements

Possible enhancements for the smart contract:

* Add **timestamps**
* Support **user-specific note retrieval**
* Add **note tags/categories**

---

## License

MIT License
