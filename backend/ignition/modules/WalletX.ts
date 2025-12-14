import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



export default buildModule("WalletXModule", (m) => {
   // USDC on Celo mainnet: 0xceba9300f2b948710d2653dd7b07f33a8b32118c
   // USDC on Base mainnet: 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913
   const tokenAddress = "0xceba9300f2b948710d2653dd7b07f33a8b32118c"; // Celo mainnet USDC

  const walletX = m.contract("WalletX", [tokenAddress]);
 

  return { walletX };
});
