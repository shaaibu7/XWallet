import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



export default buildModule("WalletXModule", (m) => {
   const tokenAddress = "0xcebA9300f2b948710d2653dD7B07f33A8B32118C";

  const walletX = m.contract("WalletX", [tokenAddress]);
 

  return { walletX };
});
