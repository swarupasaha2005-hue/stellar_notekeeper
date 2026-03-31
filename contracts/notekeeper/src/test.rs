use super::*;
use soroban_sdk::testutils::{Address as _, Ledger};

// Dummy MemoToken for testing
#[contract]
pub struct TestMemoToken;

#[contractimpl]
impl TestMemoToken {
    pub fn initialize(env: Env, admin: Address) {
        env.storage().instance().set(&symbol_short!("admin"), &admin);
    }
    pub fn mint(env: Env, to: Address, amount: i128) {
        let mut balance: i128 = env.storage().persistent().get(&to).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&to, &balance);
    }
    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage().persistent().get(&addr).unwrap_or(0)
    }
}

fn setup_test(env: &Env) -> (NoteKeeperClient, Address, Address, Address) {
    let admin = Address::generate(env);
    let user = Address::generate(env);
    
    // Register NoteKeeper
    let contract_id = env.register(NoteKeeper, ());
    let client = NoteKeeperClient::new(env, &contract_id);

    // Register TestMemoToken
    let token_id = env.register(TestMemoToken, ());
    
    // Initialize NoteKeeper
    client.initialize(&admin, &token_id);
    
    // Initialize Token
    let token_client = MemoTokenClient::new(env, &token_id);
    token_client.initialize(&contract_id); 

    (client, admin, user, token_id)
}

#[test]
fn test_add_and_get_notes() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _, user, token_id) = setup_test(&env);

    let content = String::from_str(&env, "First note");
    client.add_note(&user, &content);

    let all_notes = client.get_all_notes();
    assert_eq!(all_notes.len(), 1);
    
    let note = all_notes.get(0).unwrap();
    assert_eq!(note.content, content);
    assert_eq!(note.owner, user);
    assert_eq!(note.id, 1);
    assert_eq!(note.timestamp, env.ledger().timestamp());

    // Check Reward Token Balance
    let token_client = MemoTokenClient::new(&env, &token_id);
    assert_eq!(token_client.balance(&user), 1);
}

#[test]
fn test_update_note() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _, user, _) = setup_test(&env);

    client.add_note(&user, &String::from_str(&env, "Original content"));
    
    let new_content = String::from_str(&env, "Updated content");
    client.update_note(&user, &1, &new_content);

    let notes = client.get_user_notes(&user);
    assert_eq!(notes.get(0).unwrap().content, new_content);
}

#[test]
fn test_delete_note() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _, user, _) = setup_test(&env);

    client.add_note(&user, &String::from_str(&env, "Note to delete"));
    assert_eq!(client.get_all_notes().len(), 1);

    client.delete_note(&user, &1);
    assert_eq!(client.get_all_notes().len(), 0);
}

#[test]
#[should_panic(expected = "not authorized")]
fn test_unauthorized_update() {
    let env = Env::default();
    env.mock_all_auths();
    let (client, _, user1, _) = setup_test(&env);
    let user2 = Address::generate(&env);
    
    client.add_note(&user1, &String::from_str(&env, "User 1's note"));

    // User 2 tries to update User 1's note
    client.update_note(&user2, &1, &String::from_str(&env, "Hacked!"));
}
