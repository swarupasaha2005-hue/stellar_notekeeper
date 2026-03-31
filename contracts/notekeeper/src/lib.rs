#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec,
};

#[contract]
pub struct NoteKeeper;

#[contracttype]
#[derive(Clone)]
pub struct Note {
    pub id: u64,
    pub owner: Address,
    pub content: String,
    pub timestamp: u64,
}

#[contracttype]
#[derive(Clone)]
pub enum DataKey {
    Note(u64),
    UserNotes(Address),
    NoteCount,
    RewardToken,
    Admin,
}

#[contractimpl]
impl NoteKeeper {
    pub fn initialize(env: Env, admin: Address, reward_token: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RewardToken, &reward_token);
    }

    // Add a new note
    pub fn add_note(env: Env, user: Address, content: String) -> u64 {
        user.require_auth();

        let id: u64 = env.storage().instance().get(&DataKey::NoteCount).unwrap_or(0) + 1;
        let timestamp = env.ledger().timestamp();

        let note = Note {
            id,
            owner: user.clone(),
            content,
            timestamp,
        };

        // Store the note
        env.storage().persistent().set(&DataKey::Note(id), &note);

        // Update user's note list
        let mut user_notes: Vec<u64> = env
            .storage()
            .persistent()
            .get(&DataKey::UserNotes(user.clone()))
            .unwrap_or(Vec::new(&env));
        user_notes.push_back(id);
        env.storage().persistent().set(&DataKey::UserNotes(user.clone()), &user_notes);

        // Update global count
        env.storage().instance().set(&DataKey::NoteCount, &id);

        // Mint reward tokens (1 MEMO per note)
        let reward_token: Address = env.storage().instance().get(&DataKey::RewardToken).expect("reward token not set");
        let reward_client = MemoTokenClient::new(&env, &reward_token);
        reward_client.mint(&user, &1);

        // Emit Event
        env.events().publish(
            (symbol_short!("note"), symbol_short!("added")),
            (id, user),
        );

        id
    }

    // Update an existing note
    pub fn update_note(env: Env, user: Address, note_id: u64, new_content: String) {
        user.require_auth();

        let mut note: Note = env.storage().persistent().get(&DataKey::Note(note_id)).expect("note not found");
        
        if note.owner != user {
            panic!("not authorized");
        }

        note.content = new_content;
        env.storage().persistent().set(&DataKey::Note(note_id), &note);

        // Emit Event
        env.events().publish(
            (symbol_short!("note"), symbol_short!("updated")),
            (note_id, user),
        );
    }

    // Delete an existing note
    pub fn delete_note(env: Env, user: Address, note_id: u64) {
        user.require_auth();

        let note: Note = env.storage().persistent().get(&DataKey::Note(note_id)).expect("note not found");
        
        if note.owner != user {
            panic!("not authorized");
        }

        // Remove from persistent storage
        env.storage().persistent().remove(&DataKey::Note(note_id));

        // Note: Removing from UserNotes list is optional but recommended
        // For simplicity in this demo, we'll keep it in the list but checking existence in get_notes
        
        // Emit Event
        env.events().publish(
            (symbol_short!("note"), symbol_short!("deleted")),
            (note_id, user),
        );
    }

    // Get all notes for the contract (All public)
    pub fn get_all_notes(env: Env) -> Vec<Note> {
        let count: u64 = env.storage().instance().get(&DataKey::NoteCount).unwrap_or(0);
        let mut all_notes = Vec::new(&env);
        for i in 1..=count {
            if let Some(note) = env.storage().persistent().get::<DataKey, Note>(&DataKey::Note(i)) {
                all_notes.push_back(note);
            }
        }
        all_notes
    }

    // Get notes for a specific user
    pub fn get_user_notes(env: Env, user: Address) -> Vec<Note> {
        let note_ids: Vec<u64> = env.storage().persistent().get(&DataKey::UserNotes(user)).unwrap_or(Vec::new(&env));
        let mut user_notes = Vec::new(&env);
        for id in note_ids.iter() {
            if let Some(note) = env.storage().persistent().get::<DataKey, Note>(&DataKey::Note(id)) {
                user_notes.push_back(note);
            }
        }
        user_notes
    }

    pub fn get_reward_token(env: Env) -> Address {
        env.storage().instance().get(&DataKey::RewardToken).expect("reward token not set")
    }
}

// Client for cross-contract call
#[soroban_sdk::contractclient(name = "MemoTokenClient")]
pub trait MemoTokenTrait {
    fn initialize(env: Env, admin: Address);
    fn mint(env: Env, to: Address, amount: i128);
    fn balance(env: Env, addr: Address) -> i128;
}

#[cfg(test)]
mod test;
