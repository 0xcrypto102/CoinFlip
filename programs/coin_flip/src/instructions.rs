use anchor_lang::prelude::*;

use crate::{constants::*, errors::*, events::*, state::*};
use crate::state::{GlobalState, UserInfo};
use crate::constants::{ GLOBAL_STATE_SEED, USER_INFO_SEED, VAULT_SEED };
use anchor_spl::token::{self, Token, Mint,  TokenAccount, Transfer};

use solana_program::{program::{invoke,invoke_signed}, system_instruction};

use orao_solana_vrf::program::OraoVrf;
use orao_solana_vrf::state::NetworkState;
use orao_solana_vrf::CONFIG_ACCOUNT_SEED;
use orao_solana_vrf::RANDOMNESS_ACCOUNT_SEED;
use orao_solana_vrf::state::Randomness;

use std::mem::size_of;
use orao_solana_vrf::cpi::accounts::{ Request };

pub fn initialize(ctx: Context<Initialize>, fee: u64, max_bet: u64) -> Result<()> {
    let accts = ctx.accounts;

    if fee > 100 {
        return Err(CoinFlipError::FeeUnVaildAmount.into());
    }
    accts.global_state.owner = accts.owner.key();
    accts.global_state.fee = fee;
    accts.global_state.max_bet = max_bet;
    accts.global_state.vault = accts.vault.key();

    Ok(())
}

pub fn coin_flip_bet(ctx: Context<CoinFlipBet>,force: [u8; 32], guess: u8, amount: u64) -> Result<()> {
    let accts = ctx.accounts;

    if amount > accts.global_state.max_bet {
        return Err(CoinFlipError::MaxBetAmount.into());
    }

    if amount == 0 {
        return Err(CoinFlipError::InvalidAmount.into());
    }

    // Transfer sol from the user to the program
    invoke(
        &system_instruction::transfer(
            &accts.user.key(),
            &accts.vault.key(),
            amount * (100 - accts.global_state.fee) / 100,
        ),
        &[
            accts.user.to_account_info().clone(),
            accts.vault.clone(),
            accts.system_program.to_account_info().clone(),
        ],
    )?;

    invoke(
        &system_instruction::transfer(
            &accts.user.key(),
            &accts.owner.key(),
            amount * accts.global_state.fee / 100,
        ),
        &[
            accts.user.to_account_info().clone(),
            accts.owner.to_account_info().clone(),
            accts.system_program.to_account_info().clone(),
        ],
    )?;

    accts.user_info.guess = guess;
    accts.user_info.amount = amount;
    accts.user_info.random = accts.random.key();
    accts.user_info.claimed = false;
    accts.user_info.force = force;

    // Request randomness.
    let cpi_program = accts.vrf.to_account_info();
    let cpi_accounts = Request {
        payer: accts.user.to_account_info(),
        network_state: accts.config.to_account_info(),
        treasury: accts.treasury.to_account_info(),
        request: accts.random.to_account_info(),
        system_program: accts.system_program.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    orao_solana_vrf::cpi::request(cpi_ctx, force)?;

    Ok(())
}

pub fn claim_bet(ctx: Context<CliamBet>) -> Result<()> {
    let accts = ctx.accounts;

    if accts.random.data_is_empty() {
        return Err(CoinFlipError::UninitializedAccount.into());
    }

    let account = Randomness::try_deserialize(&mut &accts.random.data.borrow()[..])?;
    
    if let Some(randomness) = account.fulfilled() {
        let rand = get_vaule(randomness);
        if rand == accts.user_info.guess {

            if accts.user_info.claimed == true {
                return Err(CoinFlipError::AlreadyClaimed.into());
            }

            let (_, bump) = Pubkey::find_program_address(&[VAULT_SEED], &crate::ID);

            invoke_signed(
                &system_instruction::transfer(&accts.vault.key(), &accts.user.key(), (200 - accts.global_state.fee) * accts.user_info.amount / 100),
                &[
                    accts.vault.to_account_info().clone(),
                    accts.user.to_account_info().clone(),
                    accts.system_program.to_account_info().clone(),
                ],
                &[&[VAULT_SEED, &[bump]]],
            )?;
            accts.user_info.claimed = true;
        }
    }

    Ok(())
}

pub fn deposit_sol(ctx: Context<ManagePool>, amount: u64) -> Result<()> {
    let accts = ctx.accounts;
    
    if accts.global_state.owner != accts.owner.key() {
        return Err(CoinFlipError::NotAllowedOwner.into());
    }
    //  deposit sol from owner to valut account for reward pool
    invoke(
        &system_instruction::transfer(
            &accts.owner.key(),
            &accts.vault.key(),
            amount
        ),
        &[
            accts.owner.to_account_info().clone(),
            accts.vault.to_account_info().clone(),
            accts.system_program.to_account_info().clone(),
        ],
    )?;
    
    Ok(())
}

pub fn withdraw_sol(ctx: Context<ManagePool>, amount: u64) -> Result<()> {
    let accts = ctx.accounts;
    
    if accts.global_state.owner != accts.owner.key() {
        return Err(CoinFlipError::NotAllowedOwner.into());
    }
    
    //  withdraw sol from vault to owner account to refund the reward pool
    let (_, bump) = Pubkey::find_program_address(&[VAULT_SEED], &crate::ID);

    invoke_signed(
        &system_instruction::transfer(&accts.vault.key(), &accts.owner.key(), amount),
        &[
            accts.vault.to_account_info().clone(),
            accts.owner.to_account_info().clone(),
            accts.system_program.to_account_info().clone(),
        ],
        &[&[VAULT_SEED, &[bump]]],
    )?;
    
    Ok(())
}


fn get_vaule(randomness: &[u8; 64]) -> u8 {
    // use only first 8 bytes for simplicyty
    let value = randomness[0..size_of::<u64>()].try_into().unwrap();
    (u64::from_le_bytes(value) % 2).try_into().unwrap()
}


#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    
    #[account(
        init,
        payer = owner,
        seeds = [GLOBAL_STATE_SEED, owner.key().as_ref()],
        bump,
        space = 8 + size_of::<GlobalState>()
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK:` doc comment explaining why no checks through types are necessary.
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault: AccountInfo<'info>, // to receive SOL

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(force: [u8; 32])]
pub struct CoinFlipBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED, owner.key().as_ref()],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK:` doc comment explaining why no checks through types are necessary.
    #[account(
        mut,
        seeds = [VAULT_SEED],
        bump
    )]
    pub vault: AccountInfo<'info>, // to receive SOL

    /// CHECK:` doc comment explaining why no checks through types are necessary.
    #[account(
        mut,
        address = global_state.owner
    )]
    pub owner: AccountInfo<'info>,

    #[account(
        init_if_needed,
        payer = user,
        seeds = [USER_INFO_SEED, user.key().as_ref()],
        bump,
        space = 8 + size_of::<UserInfo>()
    )]
    pub user_info: Account<'info, UserInfo>,
    
    /// This account is the current VRF request account, it'll be the `request` account in the CPI call.
    /// CHECK:
    #[account(
        mut,
        seeds = [RANDOMNESS_ACCOUNT_SEED.as_ref(), &force],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub random: AccountInfo<'info>,

    /// CHECK:` doc comment explaining why no checks through types are necessary.
    #[account(mut)]
    pub treasury: AccountInfo<'info>,

    #[account(
        mut,
        seeds = [CONFIG_ACCOUNT_SEED.as_ref()],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub config: Box<Account<'info, NetworkState>>,
    pub vrf: Program<'info, OraoVrf>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

#[derive(Accounts)]
pub struct CliamBet<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED, global_state.owner.as_ref()],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK:` doc comment explaining why no checks through types are necessary.
    #[account(
        mut,
        address = global_state.vault
    )]
    pub vault: AccountInfo<'info>, // to receive SOL

    #[account(
        mut,
        seeds = [USER_INFO_SEED, user.key().as_ref()],
        bump,
    )]
    pub user_info: Account<'info, UserInfo>,

     /// CHECK:
     #[account(
        seeds = [RANDOMNESS_ACCOUNT_SEED.as_ref(), user_info.force.as_ref()],
        bump,
        seeds::program = orao_solana_vrf::ID
    )]
    pub random: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct ManagePool<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        seeds = [GLOBAL_STATE_SEED, owner.key().as_ref()],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    /// CHECK:` doc comment explaining why no checks through types are necessary.
    #[account(
        mut,
        address = global_state.vault
    )]
    pub vault: AccountInfo<'info>, // to receive SOL

    pub system_program: Program<'info, System>
}