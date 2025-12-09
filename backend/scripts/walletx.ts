import { ethers } from "hardhat";

export interface IERC20 {
  balanceOf(account: string): Promise<bigint>;
  allowance(owner: string, spender: string): Promise<bigint>;
  approve(spender: string, amount: bigint): Promise<any>;
  transfer(to: string, amount: bigint): Promise<any>;
  transferFrom(from: string, to: string, amount: bigint): Promise<any>;
}

export interface IWalletX {
  registerWallet(walletName: string, fundAmount: bigint): Promise<any>;
  onboardMembers(
    memberAddress: string,
    memberName: string,
    fundAmount: bigint,
    memberIdentifier: bigint
  ): Promise<any>;
  reimburseWallet(amount: bigint): Promise<any>;
}

async function main() {
  // Hardhat loads your PRIVATE_KEY signer from config
  const signer = await ethers.getSigner();
  console.log("Using signer:", await signer.getAddress());

  const walletXAddress = "0xYourWalletXContract";
  const tokenAddress = "0xYourERC20Token";

  const token = await ethers.getContractAt("IERC20", tokenAddress, signer) as unknown as IERC20;
  const walletX = await ethers.getContractAt("WalletX", walletXAddress, signer) as unknown as IWalletX;

  const fundAmount = ethers.parseEther("10");
  await token.approve(walletXAddress, fundAmount);
  const tx1 = await walletX.registerWallet("My WalletX", fundAmount);
  await tx1.wait();

  const tx2 = await walletX.onboardMembers(
    "0xMemberAddress",
    "John Doe",
    ethers.parseEther("3"),
    1001n
  );
  await tx2.wait();

  await token.approve(walletXAddress, ethers.parseEther("5"));
  const tx3 = await walletX.reimburseWallet(ethers.parseEther("5"));
  await tx3.wait();

  console.log("All done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
