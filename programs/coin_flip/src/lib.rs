mod errors;
mod events;
mod instructions;
mod state;
mod constants;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("4gCjdyt4nGm61fZaiLjApNQyE8fA7rKag2LxNWULFMPC");

#[program]
pub mod coin_flip {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>, fee: u64, max_bet: u64) -> Result<()> {
        instructions::initialize(ctx, fee, max_bet)
    }

    pub fn update_fee(ctx: Context<UpdateFee>, fee: u64) -> Result<()> {
        instructions::update_fee(ctx, fee)
    }

    pub fn update_owner(ctx: Context<UpdateOwner>, new_owner: Pubkey) -> Result<()> {
        instructions::update_owner(ctx, new_owner)
    }

    pub fn coin_flip_bet(ctx: Context<CoinFlipBet>,force: [u8; 32], guess: u8, amount: u64) -> Result<()> {
        instructions::coin_flip_bet(ctx,force, guess, amount)
    }

    pub fn claim_bet(ctx: Context<CliamBet>) -> Result<()> {
        instructions::claim_bet(ctx)
    }

    pub fn deposit_sol(ctx: Context<ManagePool>, amount: u64) -> Result<()> {
        instructions::deposit_sol(ctx, amount)
    }

    pub fn withdraw_sol(ctx: Context<ManagePool>, amount: u64) -> Result<()> {
        instructions::withdraw_sol(ctx, amount)
    }
}

