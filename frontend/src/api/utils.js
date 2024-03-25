import { Connection, PublicKey, LAMPORTS_PER_SOL, SYSVAR_CLOCK_PUBKEY, SystemProgram } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, createAccount, createAssociatedTokenAccount, getAssociatedTokenAddress , ASSOCIATED_TOKEN_PROGRAM_ID,createMint, mintTo, mintToChecked, getAccount, getMint, getAssociatedTokenAddressSync,  } from "@solana/spl-token";
import { Program, AnchorProvider, web3, utils, } from '@project-serum/anchor';
import * as anchor from "@project-serum/anchor";
import {
  Orao,
  networkStateAccountAddress,
  randomnessAccountAddress,
  FulfillBuilder,
  InitBuilder,
} from "@orao-network/solana-vrf";
import { Buffer } from 'buffer';
import IDL from "../../coin_flip.json";

const RPC_URL = process.env.RPC_URL;
const GLOBAL_STATE_SEED = process.env.GLOBAL_STATE_SEED;
const VAULT_SEED = process.env.VAULT_SEED;
const USER_INFO_SEED = process.env.USER_INFO_SEED;
const RANDOM_SEED = process.env.RANDOM_SEED;

const connection = new Connection(RPC_URL,'confirmed');
const opts = {
  preflightCommitment:"processed",
};
const programID = new PublicKey(IDL.metadata.address);
const OWNER_PUBKEY = new anchor.web3.PublicKey(process.env.OWNER_PUBKEY);

export const getWalletSOLBalance = async (publicKey, connection) => {
  let balance = 0;
  try {
    balance = await connection.getBalance(
      publicKey,
      'confirmed'
    );
    balance = balance / LAMPORTS_PER_SOL;
  } catch (e) {
    console.log(`error getting balance: `, e);
  }
  return balance;
}

export const getResult = async (wallet, betAmount, selectedSide) => {
  const provider = await getProvide(wallet);
  const program = new Program(IDL, programID, provider);
  const timestamp = Math.floor(Date.now() / 1000);
  const vrf = new Orao(provider);
  const bettingAmount = parseFloat(betAmount);

  const [ globalState ] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(GLOBAL_STATE_SEED),
      OWNER_PUBKEY.toBuffer()
    ],
    program.programId
  );

  const globalStateData = await program.account.globalState.fetch(globalState);

  const [ vault ] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(VAULT_SEED)
    ],
    program.programId
  );

  const [ userInfo ] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(USER_INFO_SEED),
      wallet.publicKey.toBuffer()
    ],
    program.programId
  );


  const [force] = await anchor.web3.PublicKey.findProgramAddress(
    [
      Buffer.from(RANDOM_SEED),
      new anchor.BN(timestamp).toArrayLike(Buffer, 'le', 4),
      wallet.publicKey.toBuffer()
    ],
    program.programId
  );

  const random = randomnessAccountAddress(force.toBuffer());

  const networkState = await vrf.getNetworkState();
  const treasury = networkState.config.treasury;
  const guess = selectedSide === 'HEADS' ? 0 : 1;
  
  try {
    const tx = await program.rpc.coinFlipBet(
      [...force.toBuffer()],
      guess,
      new anchor.BN(bettingAmount * LAMPORTS_PER_SOL),
      {
        accounts: {
          user: wallet.publicKey,
          globalState,
          vault,
          owner: globalStateData.owner,
          userInfo,
          random,
          treasury,
          config: networkStateAccountAddress(),
          vrf: vrf.programId,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          clock: SYSVAR_CLOCK_PUBKEY
        },
      }
    );

    const randomness = await vrf.waitFulfilled(force.toBuffer());
    const rand =  randomness.fulfilled();
    
    if(rand[0] % 2 == guess) {
      const claim_bet = await program.rpc.claimBet(
        {
          accounts: {
            user: wallet.publicKey,
            globalState,
            vault,
            userInfo,
            random,
            systemProgram: SystemProgram.programId
          },
        }
      );
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

export const getProvide = async (wallet) => {
  const provider = new AnchorProvider(
    connection,
    wallet,
    opts.preflightCommitment
  );
  return provider;
}