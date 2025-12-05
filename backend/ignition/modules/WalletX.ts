import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



export default buildModule("WalletXModule", (m) => {
   const tokenAddress = "0x0460d14B61EbB5cB2465687E8F11A0383CBfAe46";

  const walletX = m.contract("WalletX", [tokenAddress]);
 

  return { walletX };
});
