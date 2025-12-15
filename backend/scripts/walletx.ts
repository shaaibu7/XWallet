import { network } from "hardhat";

const { ethers } = await network.connect({
  network: "base",
  chainType: "l1",
});

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
  reimburseMember(memberIdentifier: bigint, amount: bigint): Promise<any>;
}

async function main() {
  // Hardhat loads your PRIVATE_KEY signer from config
  const [signer] = await ethers.getSigners();
  const signerAddress = signer.address;
  console.log("Using signer:", signerAddress);

  // Base mainnet addresses
  const walletXAddress = "0x235ead9400a7d6dBF27f984cd4d74B47A132F47F";
  const tokenAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"; // USDC on Base

  const token = await ethers.getContractAt("IERC20", tokenAddress, signer) as unknown as IERC20;
  const walletX = await ethers.getContractAt("WalletX", walletXAddress, signer) as unknown as IWalletX;

  console.log("\n=== Starting 5 Transaction Script ===\n");

  // Check USDC balance
  const balance = await token.balanceOf(signerAddress);
  const balanceFormatted = ethers.formatUnits(balance, 6);
  console.log(`Current USDC Balance: ${balanceFormatted} USDC\n`);

  if (balance < ethers.parseUnits("0.01", 6)) {
    console.error("⚠️  Insufficient USDC balance. Please fund your account with USDC on Base mainnet.");
    console.error("   You need at least 0.01 USDC to run this script.");
    process.exit(1);
  }

  // Use smaller amounts based on available balance (use 80% to leave some for gas)
  const maxAmount = (balance * 80n) / 100n; // Use 80% of balance
  const fundAmount = maxAmount > ethers.parseUnits("0.01", 6) 
    ? maxAmount 
    : ethers.parseUnits("0.01", 6);

  // Helper function to wait for transaction with confirmation
  const waitForTx = async (tx: any, description: string) => {
    console.log(`  TX Hash: ${tx.hash}`);
    const receipt = await tx.wait();
    console.log(`  ✓ ${description} (Block: ${receipt.blockNumber})`);
    // Small delay to ensure nonce is updated
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  // Transaction 1: Approve USDC for WalletX
  console.log("Transaction 1: Approving USDC for WalletX...");
  const approveAmount = fundAmount * 10n; // Approve 10x for multiple operations
  const tx1 = await token.approve(walletXAddress, approveAmount);
  await waitForTx(tx1, "Approval confirmed");
  console.log();

  // Transaction 2: Register Wallet
  console.log("Transaction 2: Registering wallet...");
  console.log(`  Funding with: ${ethers.formatUnits(fundAmount, 6)} USDC`);
  const tx2 = await walletX.registerWallet("My WalletX Organization", fundAmount);
  await waitForTx(tx2, "Wallet registered");
  console.log();

  // Transaction 3: Onboard Member
  console.log("Transaction 3: Onboarding member...");
  // Using a different address for member (you can change this)
  const memberAddress = signerAddress; // For testing, using same address
  const memberLimit = fundAmount / 3n; // 1/3 of fund amount
  const tx3 = await walletX.onboardMembers(
    memberAddress,
    "John Doe",
    memberLimit,
    1001n
  );
  await waitForTx(tx3, "Member onboarded");
  console.log();

  // Transaction 4: Reimburse Wallet (only if we have remaining balance)
  console.log("Transaction 4: Reimbursing wallet...");
  const reimburseAmount = fundAmount / 2n; // Half of original fund
  if (reimburseAmount > 0n) {
    const tx4 = await token.approve(walletXAddress, reimburseAmount);
    await waitForTx(tx4, "Approval for reimbursement");
    const tx5 = await walletX.reimburseWallet(reimburseAmount);
    await waitForTx(tx5, "Wallet reimbursed");
    console.log();
  } else {
    console.log("  ⚠️  Skipping - insufficient balance\n");
  }

  // Transaction 5: Reimburse Member
  console.log("Transaction 5: Reimbursing member...");
  const memberReimburseAmount = fundAmount / 5n; // 1/5 of fund amount
  if (memberReimburseAmount > 0n) {
    const tx6 = await walletX.reimburseMember(1001n, memberReimburseAmount);
    await waitForTx(tx6, "Member reimbursed");
    console.log();
  } else {
    console.log("  ⚠️  Skipping - insufficient balance\n");
  }

  console.log("=== All 5 Transactions Completed Successfully! ===\n");
  
  // Display wallet info
  try {
    const wallet = await walletX.getWalletAdmin();
    console.log("Wallet Info:");
    console.log("  Name:", wallet.walletName);
    console.log("  Balance:", ethers.formatUnits(wallet.walletBalance, 6), "USDC");
    console.log("  Wallet ID:", wallet.walletId.toString());
  } catch (error) {
    console.log("Could not fetch wallet info");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
