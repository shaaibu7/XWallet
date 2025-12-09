import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";



export default buildModule("WalletXModule", (m) => {
   const tokenAddress = "0x4711af2c89D77Fa080557dE56745EceAcB5Ae734";

  const walletX = m.contract("WalletX", [tokenAddress]);
 

  return { walletX };
});
