// scripts/interact.js

const { ethers } = require("hardhat");

async function main() {
    // -------------------------------
    // 1. Connect to accounts
    // -------------------------------
    // const [admin, member1] = await ethers.getSigners();

    const admin = 0x3258e2a392e96abef2eeaba378cfdf9729b7ae01;
    const member1 = 0xb725e575b82b57c73f81e51808af1b2e8c4387bb;

    console.log("Admin:", admin.address);
    console.log("Member 1:", member1.address);

    // -------------------------------
    // 2. Contract addresses
    // -------------------------------
    const tokenAddress = "0x0460d14B61EbB5cB2465687E8F11A0383CBfAe46";
    const walletXAddress = "0xC8EBcbFda0aE7B725f7ebEBDcE0092021407d8d0";

    // -------------------------------
    // 3. Contract Instances
    // -------------------------------
    const token = await ethers.getContractAt("IERC20", tokenAddress);
    const walletX = await ethers.getContractAt("WalletX", walletXAddress);

    // ======================================================
    // EXAMPLE FUNCTIONS — Call each by uncommenting
    // ======================================================

    // await registerWallet(admin, token, walletX);
    // await onboardMember(admin, member1, walletX);
    // await reimburseWallet(admin, token, walletX);
    // await reimburseMember(admin, walletX);
    // await readAdmin(walletX, admin);
    // await readMembers(walletX, admin);
    // await readMember(walletX, member1);
    // await readMemberTransactions(walletX, member1);
    // await getAdminRole(walletX, admin.address);
}

// ======================================================
//  Register Wallet
// ======================================================
async function registerWallet(admin, token, walletX) {
    console.log("\nRegistering wallet...");

    const fundAmount = ethers.parseUnits("1000", 18);
    const walletName = "My Organization Wallet";

    // Approve spending
    const tx1 = await token.connect(admin).approve(walletX.target, fundAmount);
    await tx1.wait();
    console.log("Approved!");

    // Register new wallet
    const tx2 = await walletX.connect(admin).registerWallet(walletName, fundAmount);
    await tx2.wait();
    console.log("Wallet successfully registered!");
}

// ======================================================
//  Onboard Member
// ======================================================
async function onboardMember(admin, member, walletX) {
    console.log("\nOnboarding member...");

    const memberName = "John Doe";
    const fundAmount = ethers.parseUnits("200", 18);
    const memberIdentifier = 1;

    const tx = await walletX
        .connect(admin)
        .onboardMembers(member.address, memberName, fundAmount, memberIdentifier);

    await tx.wait();

    console.log(`Member onboarded successfully: ${member.address}`);
}

// ======================================================
//  Reimburse Wallet (Admin adds more funds)
// ======================================================
async function reimburseWallet(admin, token, walletX) {
    console.log("\nReimbursing wallet...");

    const amount = ethers.parseUnits("500", 18);

    const approveTx = await token.connect(admin).approve(walletX.target, amount);
    await approveTx.wait();

    const tx = await walletX.connect(admin).reimburseWallet(amount);
    await tx.wait();

    console.log("Wallet reimbursed successfully!");
}

// ======================================================
//  Reimburse Member (Admin increases member spendLimit)
// ======================================================
async function reimburseMember(admin, walletX) {
    console.log("\nReimbursing a member...");

    const memberIdentifier = 1;
    const amount = ethers.parseUnits("100", 18);

    const tx = await walletX
        .connect(admin)
        .reimburseMember(memberIdentifier, amount);

    await tx.wait();
    console.log("Member reimbursed successfully!");
}

// ======================================================
//  READ FUNCTIONS (GETTERS)
// ======================================================

async function readAdmin(walletX, admin) {
    console.log("\nFetching admin wallet info...");

    const adminWallet = await walletX.connect(admin).getWalletAdmin();
    console.log(adminWallet);
}

async function readMembers(walletX, admin) {
    console.log("\nFetching all members under admin...");

    const members = await walletX.connect(admin).getMembers();
    console.log(members);
}

async function readMember(walletX, member) {
    console.log("\nFetching member info...");

    const memberInfo = await walletX.connect(member).getMember();
    console.log(memberInfo);
}

async function readMemberTransactions(walletX, member) {
    console.log("\nFetching member transactions...");

    const txs = await walletX.getMemberTransactions(member.address);
    console.log(txs);
}

async function getAdminRole(walletX, userAddress) {
    console.log("\nFetching admin role...");

    const role = await walletX.getAdminRole(userAddress);
    console.log("Role:", role);
}

// ======================================================
// Execute Script
// ======================================================
main().catch((err) => {
    console.error(err);
    process.exitCode = 1;
});
