import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CoinFlip } from "../target/types/coin_flip";
import { SystemProgram, Keypair, PublicKey, Transaction, SYSVAR_RENT_PUBKEY, SYSVAR_CLOCK_PUBKEY, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID, createAccount, createAssociatedTokenAccount, getAssociatedTokenAddress , ASSOCIATED_TOKEN_PROGRAM_ID,createMint, mintTo, mintToChecked, getAccount, getMint, getAssociatedTokenAddressSync,  } from "@solana/spl-token";
import {
  Orao,
  networkStateAccountAddress,
  randomnessAccountAddress,
  FulfillBuilder,
  InitBuilder,
} from "@orao-network/solana-vrf";

describe("coin_flip", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.CoinFlip as Program<CoinFlip>;
  let connection = program.provider.connection;
  const provdier = anchor.AnchorProvider.env();

  const owner = Keypair.fromSecretKey(Uint8Array.from(/* */));
  const user = Keypair.fromSecretKey(Uint8Array.from(/* */));
  
  //  set the pda seeds
  const GLOBAL_STATE_SEED = "GLOBAL-STATE-SEED";
  const VAULT_SEED = "VAULT-SEED";
  const RANDOM_SEED = "RANDOM-SEED";
  const USER_INFO_SEED = "USER-INFO-SEED";

  // set the vrf
  const vrf = new Orao(provdier);

  // set the global state variables
  const fee = 4; // the server platform fee
  const max_bet = 2 * LAMPORTS_PER_SOL;

  let globalState, vault, userInfo, force: PublicKey;
  let globalStateBump, vaultBump, userInfoBump, focrceBump: Number;

  it("GET PDA", async() => {
    [globalState, globalStateBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(GLOBAL_STATE_SEED),
      ],
      program.programId
    );

    [vault, vaultBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(VAULT_SEED)
      ],
      program.programId
    );

    [userInfo, userInfoBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(USER_INFO_SEED),
        user.publicKey.toBuffer()
      ],
      program.programId
    );

   
  })
 
  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.rpc.initialize(
      new anchor.BN(fee),
      new anchor.BN(max_bet),
      {
        accounts: {
          owner: owner.publicKey,
          globalState,
          vault,
          systemProgram: SystemProgram.programId
        },
        signers: [owner]
      }
    );
    console.log("Your transaction signature", tx);

    const globalStateData = await program.account.globalState.fetch(globalState);
    console.log("owner: ",globalStateData.owner.toString());
    console.log("fee: ", Number(globalStateData.fee));
    console.log("max_bet: ",Number(globalStateData.maxBet));
  }); 

  it("Deposit sol for reward pool", async() => {
    const deposit_amount = 4 * LAMPORTS_PER_SOL; 
    try {
      const depsit_tx = await program.rpc.depositSol(
        new anchor.BN(deposit_amount),
        {
          accounts: {
            owner: owner.publicKey,
            globalState,
            vault,
            systemProgram: SystemProgram.programId
          },
          signers: [owner]
        }
      );
      console.log("tx->", depsit_tx);

      const globalStateData = await program.account.globalState.fetch(globalState);
      let balance = await connection.getBalance(new PublicKey(globalStateData.vault.toString()));
      console.log(`Vault Balance: ${balance/LAMPORTS_PER_SOL}`);
    } catch (error) {
      console.log(error);
    }
  }); 
  
  it("withdraw sol for reward pool", async() => {
    const deposit_amount = 0.04 * LAMPORTS_PER_SOL; 
    try {
      const depsit_tx = await program.rpc.withdrawSol(
        new anchor.BN(deposit_amount),
        {
          accounts: {
            owner: owner.publicKey,
            globalState,
            vault,
            systemProgram: SystemProgram.programId
          },
          signers: [owner]
        }
      );
      console.log("tx->", depsit_tx);

      const globalStateData = await program.account.globalState.fetch(globalState);
      let balance = await connection.getBalance(new PublicKey(globalStateData.vault.toString()));
      console.log(`Wallet Balance: ${balance/LAMPORTS_PER_SOL}`);
    } catch (error) {
      console.log(error);
    }
  }); 
  
  it("coin flip", async() => {
    const globalStateData = await program.account.globalState.fetch(globalState);
    const timestamp = Math.floor(Date.now() / 1000);
    [force, focrceBump] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from(RANDOM_SEED),
        new anchor.BN(timestamp).toBuffer('le', 4),
        user.publicKey.toBuffer()
      ],
      program.programId
    );
    
    const random = randomnessAccountAddress(force.toBuffer());
    console.log("random->", random);
    const networkState = await vrf.getNetworkState();
    const treasury = networkState.config.treasury;

    const flip_amount = 0.02 * LAMPORTS_PER_SOL;
    const guess = 0;

    try {
      const tx = await program.rpc.coinFlipBet(
        [...force.toBuffer()],
        guess,
        new anchor.BN(flip_amount),
        {
          accounts: {
            user: user.publicKey,
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
          signers: [user]
        }
      );

      const randomness = await vrf.waitFulfilled(force.toBuffer());
      const rand =  randomness.fulfilled();

      let user_balance = await connection.getBalance(user.publicKey);
      console.log(`After deposit: ${user_balance/LAMPORTS_PER_SOL}`);
      console.log("guess->", guess);
      console.log("rand->", rand[0]);
      
      if(rand[0] % 2 == guess) {
        console.log("winner");
        const claim_bet = await program.rpc.claimBet(
          {
            accounts: {
              user: user.publicKey,
              globalState,
              vault,
              userInfo,
              random,
              systemProgram: SystemProgram.programId
            },
            signers: [user]
          }
        );
        user_balance = await connection.getBalance(user.publicKey);
        console.log(`After Claim: ${user_balance/LAMPORTS_PER_SOL}`);
      } else {
        console.log("You lost, please try again");
      }

      let vault_balance = await connection.getBalance(new PublicKey(globalStateData.vault.toString()));
      console.log(`Vault Balance: ${vault_balance/LAMPORTS_PER_SOL}`);

      let owner_balance = await connection.getBalance(owner.publicKey);
      console.log(`owner_balance: ${owner_balance/LAMPORTS_PER_SOL}`);

    } catch (error) {
      console.log(error);
    }
   
  })
  it("Update fee", async() => {
    const fee = 3;
    const tx = await program.rpc.updateFee(
      new anchor.BN(fee),
      {
        accounts: {
          owner: owner.publicKey,
          globalState,
          systemProgram: SystemProgram.programId
        },
        signers: [owner]
      }
    );
    console.log("Your transaction signature", tx);

    const globalStateData = await program.account.globalState.fetch(globalState);
    console.log("fee: ",Number(globalStateData.fee));
  }); 
});
