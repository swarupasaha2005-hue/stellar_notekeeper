#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contract]
pub struct NoteKeeper;

#[contracttype]
#[derive(Clone)]
pub struct Note {
    pub owner: Address,
    pub content: String,
}

const NOTES: Symbol = symbol_short!("NOTES");

#[contractimpl]
impl NoteKeeper {

    // Add a new note
    pub fn add_note(env: Env, user: Address, content: String) {

        // Require authentication from the user
        user.require_auth();

        // Fetch existing notes
        let mut notes: Vec<Note> = env
            .storage()
            .instance()
            .get(&NOTES)
            .unwrap_or(Vec::new(&env));

        // Create a new note
        let note = Note {
            owner: user,
            content,
        };

        // Add note to vector
        notes.push_back(note);

        // Save updated notes
        env.storage().instance().set(&NOTES, &notes);
    }

    // Get all notes
    pub fn get_notes(env: Env) -> Vec<Note> {
        env.storage()
            .instance()
            .get(&NOTES)
            .unwrap_or(Vec::new(&env))
    }
}