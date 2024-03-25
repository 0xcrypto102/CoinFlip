/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    RPC_URL: process.env.RPC_URL,
    API_KEY: process.env.API_KEY,
    GLOBAL_STATE_SEED: process.env.GLOBAL_STATE_SEED,
    VAULT_SEED: process.env.VAULT_SEED,
    RANDOM_SEED: process.env.RANDOM_SEED,
    USER_INFO_SEED: process.env.USER_INFO_SEED,
    OWNER_PUBKEY: process.env.OWNER_PUBKEY
  }
};

export default nextConfig;
