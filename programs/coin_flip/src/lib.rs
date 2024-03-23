use anchor_lang::prelude::*;

declare_id!("4Txje2aJHy3easv6AopsmSnARknvkJ6VXoJSi46pKnRF");

#[program]
pub mod coin_flip {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
