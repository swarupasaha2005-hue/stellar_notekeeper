#[cfg(test)]
mod test {
    use soroban_sdk::{Env, Vec, String};

    #[test]
    fn test_vec_mutation() {
        let env = Env::default();
        let mut v = Vec::<u32>::new(&env);
        v.push_back(1);
        v.push_back(2);
        assert_eq!(v.len(), 2);
        
        v.set(0, 10);
        assert_eq!(v.get(0).unwrap(), 10);
        
        v.remove(0);
        assert_eq!(v.len(), 1);
        assert_eq!(v.get(0).unwrap(), 2);
    }
}
