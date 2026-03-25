#[test]
fn test_add_and_get_notes() {
    let env = Env::default();
    let contract_id = env.register(NoteKeeper, ());
    let client = NoteKeeperClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

    let content = String::from_str(&env, "First note");
    client.add_note(&user, &content);

    let notes = client.get_notes();
    assert_eq!(notes.len(), 1);
    assert_eq!(notes.get(0).unwrap().content, content);
    assert_eq!(notes.get(0).unwrap().owner, user);
    assert_eq!(notes.get(0).unwrap().id, 1);
}

#[test]
fn test_update_note() {
    let env = Env::default();
    let contract_id = env.register(NoteKeeper, ());
    let client = NoteKeeperClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

    client.add_note(&user, &String::from_str(&env, "Original content"));
    
    let new_content = String::from_str(&env, "Updated content");
    client.update_note(&user, &1, &new_content);

    let notes = client.get_notes();
    assert_eq!(notes.get(0).unwrap().content, new_content);
}

#[test]
fn test_delete_note() {
    let env = Env::default();
    let contract_id = env.register(NoteKeeper, ());
    let client = NoteKeeperClient::new(&env, &contract_id);

    let user = Address::generate(&env);
    env.mock_all_auths();

    client.add_note(&user, &String::from_str(&env, "Note to delete"));
    assert_eq!(client.get_notes().len(), 1);

    client.delete_note(&user, &1);
    assert_eq!(client.get_notes().len(), 0);
}

#[test]
#[should_panic(expected = "Not authorized to update this note")]
fn test_unauthorized_update() {
    let env = Env::default();
    let contract_id = env.register(NoteKeeper, ());
    let client = NoteKeeperClient::new(&env, &contract_id);

    let user1 = Address::generate(&env);
    let user2 = Address::generate(&env);
    
    env.mock_all_auths();
    client.add_note(&user1, &String::from_str(&env, "User 1's note"));

    // User 2 tries to update User 1's note
    client.update_note(&user2, &1, &String::from_str(&env, "Hacked!"));
}
