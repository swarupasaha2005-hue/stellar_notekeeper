#![no_std]

use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, Symbol};

const ADMIN: Symbol = symbol_short!("ADMIN");

#[contract]
pub struct MemoToken;

#[contractimpl]
impl MemoToken {
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN, &admin);
    }

    pub fn mint(env: Env, to: Address, amount: i128) {
        let admin: Address = env.storage().instance().get(&ADMIN).expect("not initialized");
        admin.require_auth();

        let mut balance: i128 = env.storage().persistent().get(&DataKey::Balance(to.clone())).unwrap_or(0);
        balance += amount;
        env.storage().persistent().set(&DataKey::Balance(to), &balance);
    }

    pub fn balance(env: Env, addr: Address) -> i128 {
        env.storage().persistent().get(&DataKey::Balance(addr)).unwrap_or(0)
    }
}

#[derive(Clone)]
#[soroban_sdk::contracttype]
pub enum DataKey {
    Balance(Address),
}
