#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol, Vec,
};

#[contract]
pub struct NoteKeeper;

#[contracttype]
#[derive(Clone)]
pub struct Note {
    pub id: u64,
    pub owner: Address,
    pub content: String,
}

const NOTES_V2: Symbol = symbol_short!("NOTESV2");
const NOTE_ID_KEY: Symbol = symbol_short!("NOTEID");

#[contractimpl]
impl NoteKeeper {

    // Add a new note
    pub fn add_note(env: Env, user: Address, content: String) {
        user.require_auth();

        let mut notes: Vec<Note> = env
            .storage()
            .instance()
            .get(&NOTES_V2)
            .unwrap_or(Vec::new(&env));
            
        let current_id: u64 = env.storage().instance().get(&NOTE_ID_KEY).unwrap_or(1);

        let note = Note {
            id: current_id,
            owner: user,
            content,
        };

        notes.push_back(note);

        env.storage().instance().set(&NOTES_V2, &notes);
        env.storage().instance().set(&NOTE_ID_KEY, &(current_id + 1));
    }
    
    // Update an existing note
    pub fn update_note(env: Env, user: Address, note_id: u64, new_content: String) {
        user.require_auth();
        
        let mut notes: Vec<Note> = env
            .storage()
            .instance()
            .get(&NOTES_V2)
            .unwrap_or(Vec::new(&env));
            
        let mut found = false;
        for i in 0..notes.len() {
            let mut note = notes.get(i).unwrap();
            if note.id == note_id {
                if note.owner != user {
                    panic!("Not authorized to update this note");
                }
                note.content = new_content.clone();
                notes.set(i, note);
                found = true;
                break;
            }
        }
        
        if !found {
            panic!("Note not found");
        }
        
        env.storage().instance().set(&NOTES_V2, &notes);
    }
    
    // Delete an existing note
    pub fn delete_note(env: Env, user: Address, note_id: u64) {
        user.require_auth();
        
        let mut notes: Vec<Note> = env
            .storage()
            .instance()
            .get(&NOTES_V2)
            .unwrap_or(Vec::new(&env));
            
        let mut found_index = None;
        for i in 0..notes.len() {
            let note = notes.get(i).unwrap();
            if note.id == note_id {
                if note.owner != user {
                    panic!("Not authorized to delete this note");
                }
                found_index = Some(i);
                break;
            }
        }
        
        if let Some(i) = found_index {
            notes.remove(i);
            env.storage().instance().set(&NOTES_V2, &notes);
        } else {
            panic!("Note not found");
        }
    }

    // Get all notes
    pub fn get_notes(env: Env) -> Vec<Note> {
        env.storage()
            .instance()
            .get(&NOTES_V2)
            .unwrap_or(Vec::new(&env))
    }
}