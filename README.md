# Coin Flip

## initialize

This is the step to init the coin flip game
- Set the fee of platform
- Set the owner of this game
- Set the max bet that the user can bet

## Deposit and Withdraw SOL

This is the step to deposit sol to the reard pool
Also, owner can withdraw the sol anytime

## CoinFlipBet

This is the step to flip the sol in the game
The game uses the oracle to generate the random
When the user flip the sol, fee will go to the owner and the rest will go to the Vault (PDA account to manage the SOL in the contract)

## ClaimBet

This is the step to cliam the reward after win in the flip game

## Test on Devnet

https://coinflip-fe.vercel.app/
