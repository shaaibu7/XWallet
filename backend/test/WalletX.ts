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

  describe("reimburseMember", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin and onboard a member
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);

      // Onboard a member
      const memberName = "John Doe";
      const memberFundAmount = ethers.parseEther("1000");
      const memberIdentifier = 1n;
      await walletX.connect(admin).onboardMembers(
        member.address,
        memberName,
        memberFundAmount,
        memberIdentifier
      );
    });

    it("Should reimburse member successfully", async function () {
      const reimbursementAmount = ethers.parseEther("500");
      const memberIdentifier = 1n;
      const initialSpendLimit = ethers.parseEther("1000");

      // Get initial member spend limit
      const memberBefore = await walletX.connect(member).getMember();
      expect(memberBefore.spendLimit).to.equal(initialSpendLimit);

      // Reimburse member
      await walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount);

      // Verify member spend limit increased
      const memberAfter = await walletX.connect(member).getMember();
      expect(memberAfter.spendLimit).to.equal(initialSpendLimit + reimbursementAmount);
    });

    it("Should fail if wallet balance is insufficient", async function () {
      const reimbursementAmount = ethers.parseEther("20000"); // More than wallet balance
      const memberIdentifier = 1n;

      await expect(
        walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount)
      ).to.be.revertedWithCustomError(walletX, "InsufficientFunds");
    });

    it("Should fail if called by non-admin", async function () {
      const reimbursementAmount = ethers.parseEther("500");
      const memberIdentifier = 1n;

      await expect(
        walletX.connect(otherAccount).reimburseMember(memberIdentifier, reimbursementAmount)
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should allow multiple reimbursements for the same member", async function () {
      const reimbursementAmount1 = ethers.parseEther("200");
      const reimbursementAmount2 = ethers.parseEther("300");
      const memberIdentifier = 1n;
      const initialSpendLimit = ethers.parseEther("1000");

      // First reimbursement
      await walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount1);

      // Second reimbursement
      await walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount2);

      // Verify total spend limit
      const member = await walletX.connect(member).getMember();
      expect(member.spendLimit).to.equal(
        initialSpendLimit + reimbursementAmount1 + reimbursementAmount2
      );
    });

    it("Should update both mapping and array when reimbursing member", async function () {
      const reimbursementAmount = ethers.parseEther("500");
      const memberIdentifier = 1n;
      const initialSpendLimit = ethers.parseEther("1000");

      // Reimburse member
      await walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount);

      // Verify member mapping is updated
      const memberFromMapping = await walletX.connect(member).getMember();
      expect(memberFromMapping.spendLimit).to.equal(initialSpendLimit + reimbursementAmount);

      // Verify organization members array is updated
      const members = await walletX.connect(admin).getMembers();
      expect(members.length).to.equal(1);
      expect(members[0].spendLimit).to.equal(initialSpendLimit + reimbursementAmount);
      expect(members[0].memberIdentifier).to.equal(memberIdentifier);
    });
  });

  describe("getWalletAdmin", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
    });

    it("Should return wallet admin data successfully", async function () {
      const wallet = await walletX.connect(admin).getWalletAdmin();

      expect(wallet.adminAddress).to.equal(admin.address);
      expect(wallet.walletName).to.equal("Test Organization");
      expect(wallet.active).to.be.true;
      expect(wallet.walletId).to.equal(1n);
      expect(wallet.walletBalance).to.equal(ethers.parseEther("10000"));
      expect(wallet.role).to.equal("admin");
    });

    it("Should fail if called by non-admin", async function () {
      await expect(
        walletX.connect(otherAccount).getWalletAdmin()
      ).to.be.revertedWith("Not a wallet admin account");
    });
  });

  describe("getAdminRole", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
    });

    it("Should return admin role for admin address", async function () {
      const role = await walletX.getAdminRole(admin.address);
      expect(role).to.equal("admin");
    });

    it("Should return empty string for non-admin address", async function () {
      const role = await walletX.getAdminRole(otherAccount.address);
      expect(role).to.equal("");
    });

    it("Should return empty string for member address", async function () {
      // Onboard a member first
      const memberName = "John Doe";
      const memberFundAmount = ethers.parseEther("1000");
      const memberIdentifier = 1n;
      await walletX.connect(admin).onboardMembers(
        member.address,
        memberName,
        memberFundAmount,
        memberIdentifier
      );

      const role = await walletX.getAdminRole(member.address);
      expect(role).to.equal("");
    });
  });

  describe("getMembers", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
    });

    it("Should return empty array when no members are onboarded", async function () {
      const members = await walletX.connect(admin).getMembers();
      expect(members.length).to.equal(0);
    });

    it("Should return all organization members", async function () {
      // Onboard first member
      const memberName1 = "John Doe";
      const memberFundAmount1 = ethers.parseEther("1000");
      const memberIdentifier1 = 1n;
      await walletX.connect(admin).onboardMembers(
        member.address,
        memberName1,
        memberFundAmount1,
        memberIdentifier1
      );

      // Onboard second member
      const memberName2 = "Jane Smith";
      const memberFundAmount2 = ethers.parseEther("2000");
      const memberIdentifier2 = 2n;
      await walletX.connect(admin).onboardMembers(
        otherAccount.address,
        memberName2,
        memberFundAmount2,
        memberIdentifier2
      );

      // Get all members
      const members = await walletX.connect(admin).getMembers();
      expect(members.length).to.equal(2);
      expect(members[0].name).to.equal(memberName1);
      expect(members[0].memberAddress).to.equal(member.address);
      expect(members[1].name).to.equal(memberName2);
      expect(members[1].memberAddress).to.equal(otherAccount.address);
    });

    it("Should fail if called by non-admin", async function () {
      await expect(
        walletX.connect(otherAccount).getMembers()
      ).to.be.revertedWith("Not a wallet admin account");
    });
  });

  describe("getMember", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin and onboard a member
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);

      const memberName = "John Doe";
      const memberFundAmount = ethers.parseEther("1000");
      const memberIdentifier = 1n;
      await walletX.connect(admin).onboardMembers(
        member.address,
        memberName,
        memberFundAmount,
        memberIdentifier
      );
    });

    it("Should return member data successfully", async function () {
      const memberData = await walletX.connect(member).getMember();

      expect(memberData.memberAddress).to.equal(member.address);
      expect(memberData.adminAddress).to.equal(admin.address);
      expect(memberData.organizationName).to.equal("Test Organization");
      expect(memberData.name).to.equal("John Doe");
      expect(memberData.active).to.be.true;
      expect(memberData.spendLimit).to.equal(ethers.parseEther("1000"));
      expect(memberData.memberIdentifier).to.equal(1n);
      expect(memberData.role).to.equal("member");
    });

    it("Should return empty/default values for non-member address", async function () {
      const memberData = await walletX.connect(otherAccount).getMember();

      expect(memberData.memberAddress).to.equal(ethers.ZeroAddress);
      expect(memberData.adminAddress).to.equal(ethers.ZeroAddress);
      expect(memberData.organizationName).to.equal("");
      expect(memberData.name).to.equal("");
      expect(memberData.active).to.be.false;
      expect(memberData.spendLimit).to.equal(0n);
      expect(memberData.memberIdentifier).to.equal(0n);
      expect(memberData.role).to.equal("");
    });
  });
});

