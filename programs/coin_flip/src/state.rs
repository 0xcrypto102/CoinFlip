use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct GlobalState {
    pub owner: Pubkey, // the pubkey of owner
    pub fee: u64, // the fee of platform
    pub max_bet: u64,
    pub vault: Pubkey,
}

#[account]
#[derive(Default)]
pub struct UserInfo {
    pub guess: u8,
    pub amount: u64,
    pub random: Pubkey,
    pub randomness: u8,
    pub claimed: bool,
    pub force:  [u8; 32],
}



