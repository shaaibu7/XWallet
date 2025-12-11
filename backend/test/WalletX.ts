import { expect } from "chai";
import { network } from "hardhat";

const { ethers } = await network.connect();

describe("WalletX", function () {
  let walletX: any;
  let mockERC20: any;
  let owner: any;
  let admin: any;
  let member: any;
  let otherAccount: any;

  beforeEach(async function () {
    [owner, admin, member, otherAccount] = await ethers.getSigners();

    // Deploy MockERC20
    mockERC20 = await ethers.deployContract("MockERC20");
    await mockERC20.waitForDeployment();

    // Deploy WalletX
    walletX = await ethers.deployContract("WalletX", [await mockERC20.getAddress()]);
    await walletX.waitForDeployment();

    // Mint tokens to admin for testing
    const mintAmount = ethers.parseEther("100000");
    await mockERC20.mint(100000);
  });

  describe("registerWallet", function () {
    it("Should register a wallet successfully with funds", async function () {
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("1000");

      // Approve tokens
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);

      // Register wallet
      await walletX.connect(admin).registerWallet(walletName, fundAmount);

      // Verify wallet was registered
      const wallet = await walletX.connect(admin).getWalletAdmin();
      expect(wallet.adminAddress).to.equal(admin.address);
      expect(wallet.walletName).to.equal(walletName);
      expect(wallet.active).to.be.true;
      expect(wallet.walletId).to.equal(1n);
      expect(wallet.walletBalance).to.equal(fundAmount);
      expect(wallet.role).to.equal("admin");
    });

    it("Should fail if wallet already exists for address", async function () {
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("1000");

      // Approve and register first time
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);

      // Try to register again - should fail
      await expect(
        walletX.connect(admin).registerWallet("Another Wallet", fundAmount)
      ).to.be.revertedWith("Cannot create multiple wallets with one wallet address");
    });

    it("Should fail if allowance is insufficient", async function () {
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("1000");
      const insufficientAmount = ethers.parseEther("500");

      // Approve less than required
      await mockERC20.connect(admin).approve(await walletX.getAddress(), insufficientAmount);

      // Try to register with more than approved - should fail
      await expect(
        walletX.connect(admin).registerWallet(walletName, fundAmount)
      ).to.be.revertedWith("No allowance to spend funds at the moment");
    });
  });

  describe("onboardMembers", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
    });

    it("Should onboard a member successfully", async function () {
      const memberName = "John Doe";
      const fundAmount = ethers.parseEther("1000");
      const memberIdentifier = 1n;

      await walletX.connect(admin).onboardMembers(
        member.address,
        memberName,
        fundAmount,
        memberIdentifier
      );

      // Verify member was onboarded
      const memberData = await walletX.connect(member).getMember();
      expect(memberData.memberAddress).to.equal(member.address);
      expect(memberData.adminAddress).to.equal(admin.address);
      expect(memberData.name).to.equal(memberName);
      expect(memberData.active).to.be.true;
      expect(memberData.spendLimit).to.equal(fundAmount);
      expect(memberData.memberIdentifier).to.equal(memberIdentifier);
      expect(memberData.role).to.equal("member");
    });

    it("Should fail if wallet balance is insufficient", async function () {
      const memberName = "John Doe";
      const fundAmount = ethers.parseEther("20000"); // More than wallet balance
      const memberIdentifier = 1n;

      await expect(
        walletX.connect(admin).onboardMembers(
          member.address,
          memberName,
          fundAmount,
          memberIdentifier
        )
      ).to.be.revertedWithCustomError(walletX, "InsufficientFunds");
    });

    it("Should fail if called by non-admin", async function () {
      const memberName = "John Doe";
      const fundAmount = ethers.parseEther("1000");
      const memberIdentifier = 1n;

      await expect(
        walletX.connect(otherAccount).onboardMembers(
          member.address,
          memberName,
          fundAmount,
          memberIdentifier
        )
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should add member to organization members list", async function () {
      const memberName = "John Doe";
      const fundAmount = ethers.parseEther("1000");
      const memberIdentifier = 1n;

      await walletX.connect(admin).onboardMembers(
        member.address,
        memberName,
        fundAmount,
        memberIdentifier
      );

      // Verify member is in organization members list
      const members = await walletX.connect(admin).getMembers();
      expect(members.length).to.equal(1);
      expect(members[0].memberAddress).to.equal(member.address);
      expect(members[0].name).to.equal(memberName);
    });
  });

  describe("reimburseWallet", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
    });

    it("Should reimburse wallet successfully", async function () {
      const reimbursementAmount = ethers.parseEther("5000");
      const initialBalance = ethers.parseEther("10000");

      // Get initial balance
      const walletBefore = await walletX.connect(admin).getWalletAdmin();
      expect(walletBefore.walletBalance).to.equal(initialBalance);

      // Approve tokens for reimbursement
      await mockERC20.connect(admin).approve(await walletX.getAddress(), reimbursementAmount);

      // Reimburse wallet
      await walletX.connect(admin).reimburseWallet(reimbursementAmount);

      // Verify wallet balance increased
      const walletAfter = await walletX.connect(admin).getWalletAdmin();
      expect(walletAfter.walletBalance).to.equal(initialBalance + reimbursementAmount);
    });

    it("Should fail if allowance is insufficient", async function () {
      const reimbursementAmount = ethers.parseEther("5000");
      const insufficientAmount = ethers.parseEther("2000");

      // Approve less than required
      await mockERC20.connect(admin).approve(await walletX.getAddress(), insufficientAmount);

      // Try to reimburse with more than approved - should fail
      await expect(
        walletX.connect(admin).reimburseWallet(reimbursementAmount)
      ).to.be.revertedWith("No allowance to spend funds at the moment");
    });

    it("Should fail if called by non-admin", async function () {
      const reimbursementAmount = ethers.parseEther("5000");

      await mockERC20.connect(otherAccount).approve(await walletX.getAddress(), reimbursementAmount);

      await expect(
        walletX.connect(otherAccount).reimburseWallet(reimbursementAmount)
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should allow multiple reimbursements", async function () {
      const reimbursementAmount1 = ethers.parseEther("2000");
      const reimbursementAmount2 = ethers.parseEther("3000");
      const initialBalance = ethers.parseEther("10000");

      // First reimbursement
      await mockERC20.connect(admin).approve(await walletX.getAddress(), reimbursementAmount1);
      await walletX.connect(admin).reimburseWallet(reimbursementAmount1);

      // Second reimbursement
      await mockERC20.connect(admin).approve(await walletX.getAddress(), reimbursementAmount2);
      await walletX.connect(admin).reimburseWallet(reimbursementAmount2);

      // Verify total balance
      const wallet = await walletX.connect(admin).getWalletAdmin();
      expect(wallet.walletBalance).to.equal(
        initialBalance + reimbursementAmount1 + reimbursementAmount2
      );
    });
  });
});

