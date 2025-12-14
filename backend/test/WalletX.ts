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

    // Mint tokens to owner and transfer to admin for testing
    const mintAmount = ethers.parseEther("100000");
    await mockERC20.mint(100000);
    // Transfer tokens from owner to admin
    await mockERC20.transfer(admin.address, mintAmount);
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
      const memberData = await walletX.connect(member).getMember();
      expect(memberData.spendLimit).to.equal(
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

    it("Should fail silently when reimbursing member with non-existent memberIdentifier", async function () {
      const reimbursementAmount = ethers.parseEther("500");
      const nonExistentIdentifier = 999n;
      const initialWalletBalance = ethers.parseEther("10000");

      // Get initial wallet balance
      const walletBefore = await walletX.connect(admin).getWalletAdmin();
      expect(walletBefore.walletBalance).to.equal(initialWalletBalance);

      // Reimburse with non-existent identifier - should not revert but also not change anything
      await walletX.connect(admin).reimburseMember(nonExistentIdentifier, reimbursementAmount);

      // Verify wallet balance unchanged (no member found, so no deduction)
      const walletAfter = await walletX.connect(admin).getWalletAdmin();
      expect(walletAfter.walletBalance).to.equal(initialWalletBalance);

      // Verify member spend limit unchanged
      const memberData = await walletX.connect(member).getMember();
      expect(memberData.spendLimit).to.equal(ethers.parseEther("1000"));
    });

    it("Should handle reimbursing member with zero amount", async function () {
      const reimbursementAmount = 0n;
      const memberIdentifier = 1n;
      const initialSpendLimit = ethers.parseEther("1000");

      // Reimburse with zero amount
      await walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount);

      // Verify member spend limit unchanged
      const memberData = await walletX.connect(member).getMember();
      expect(memberData.spendLimit).to.equal(initialSpendLimit);
    });

    it("Should reimburse member when wallet balance equals reimbursement amount exactly", async function () {
      // Reimburse wallet first to increase balance, then use exact amount
      const topUpAmount = ethers.parseEther("5000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), topUpAmount);
      await walletX.connect(admin).reimburseWallet(topUpAmount);
      
      // Now wallet balance should be 15000 (10000 + 5000)
      const walletBefore = await walletX.connect(admin).getWalletAdmin();
      const exactBalance = walletBefore.walletBalance;

      // Reimburse member with exact wallet balance
      const memberIdentifier = 1n;
      const initialSpendLimit = ethers.parseEther("1000");
      await walletX.connect(admin).reimburseMember(memberIdentifier, exactBalance);

      // Verify member spend limit increased
      const memberData = await walletX.connect(member).getMember();
      expect(memberData.spendLimit).to.equal(initialSpendLimit + exactBalance);

      // Note: Contract doesn't decrease walletBalance on reimburseMember
      // This is a known issue - balance remains unchanged
      const walletAfter = await walletX.connect(admin).getWalletAdmin();
      expect(walletAfter.walletBalance).to.equal(exactBalance);
    });

    it("Should handle spendLimit overflow scenario gracefully", async function () {
      const memberIdentifier = 1n;
      const maxUint256 = ethers.MaxUint256;
      const initialSpendLimit = ethers.parseEther("1000");

      // Try to reimburse with a very large amount that would cause overflow
      // This should fail due to insufficient wallet balance check first
      await expect(
        walletX.connect(admin).reimburseMember(memberIdentifier, maxUint256)
      ).to.be.revertedWithCustomError(walletX, "InsufficientFunds");
    });

    it("Should reimburse multiple members with same identifier (edge case)", async function () {
      // Onboard a second member with the same identifier (edge case scenario)
      const secondMemberFundAmount = ethers.parseEther("500");
      await walletX.connect(admin).onboardMembers(
        otherAccount.address,
        "Second Member Same ID",
        secondMemberFundAmount,
        1n // Same identifier as first member
      );

      const reimbursementAmount = ethers.parseEther("300");
      const memberIdentifier = 1n;

      // Get initial spend limits
      const member1Before = await walletX.connect(member).getMember();
      const member2Before = await walletX.connect(otherAccount).getMember();
      const initialSpendLimit1 = member1Before.spendLimit;
      const initialSpendLimit2 = member2Before.spendLimit;

      // Reimburse - should update both members with same identifier
      await walletX.connect(admin).reimburseMember(memberIdentifier, reimbursementAmount);

      // Verify both members' spend limits increased
      const member1After = await walletX.connect(member).getMember();
      const member2After = await walletX.connect(otherAccount).getMember();
      expect(member1After.spendLimit).to.equal(initialSpendLimit1 + reimbursementAmount);
      expect(member2After.spendLimit).to.equal(initialSpendLimit2 + reimbursementAmount);

      // Verify wallet balance - note: contract doesn't decrease balance on reimburseMember
      // This tests the current behavior (which may be a bug - balance should decrease)
      const wallet = await walletX.connect(admin).getWalletAdmin();
      // Balance remains at 10000 because onboardMembers and reimburseMember don't decrease it
      expect(wallet.walletBalance).to.equal(ethers.parseEther("10000"));
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

  describe("Wallet ID Tracking", function () {
    it("Should verify walletId starts at 1", async function () {
      const walletName = "First Wallet";
      const fundAmount = ethers.parseEther("1000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);

      const wallet = await walletX.connect(admin).getWalletAdmin();
      expect(wallet.walletId).to.equal(1n);
    });

    it("Should verify walletId increments correctly for each new wallet", async function () {
      // Register first wallet
      const walletName1 = "First Wallet";
      const fundAmount1 = ethers.parseEther("1000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount1);
      await walletX.connect(admin).registerWallet(walletName1, fundAmount1);
      const wallet1 = await walletX.connect(admin).getWalletAdmin();
      expect(wallet1.walletId).to.equal(1n);

      // Register second wallet with different admin
      const walletName2 = "Second Wallet";
      const fundAmount2 = ethers.parseEther("2000");
      await mockERC20.transfer(member.address, fundAmount2);
      await mockERC20.connect(member).approve(await walletX.getAddress(), fundAmount2);
      await walletX.connect(member).registerWallet(walletName2, fundAmount2);
      const wallet2 = await walletX.connect(member).getWalletAdmin();
      expect(wallet2.walletId).to.equal(2n);

      // Register third wallet with another admin
      const walletName3 = "Third Wallet";
      const fundAmount3 = ethers.parseEther("3000");
      await mockERC20.transfer(otherAccount.address, fundAmount3);
      await mockERC20.connect(otherAccount).approve(await walletX.getAddress(), fundAmount3);
      await walletX.connect(otherAccount).registerWallet(walletName3, fundAmount3);
      const wallet3 = await walletX.connect(otherAccount).getWalletAdmin();
      expect(wallet3.walletId).to.equal(3n);
    });

    it("Should verify walletId doesn't reset after wallet operations", async function () {
      // Register wallet
      const walletName = "Test Wallet";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
      const walletBefore = await walletX.connect(admin).getWalletAdmin();
      const initialWalletId = walletBefore.walletId;

      // Perform various operations
      await walletX.connect(admin).onboardMembers(
        member.address,
        "Test Member",
        ethers.parseEther("1000"),
        1n
      );

      await mockERC20.connect(admin).approve(await walletX.getAddress(), ethers.parseEther("5000"));
      await walletX.connect(admin).reimburseWallet(ethers.parseEther("5000"));

      await walletX.connect(admin).reimburseMember(1n, ethers.parseEther("500"));

      // Verify walletId remains unchanged
      const walletAfter = await walletX.connect(admin).getWalletAdmin();
      expect(walletAfter.walletId).to.equal(initialWalletId);
    });

    it("Should test walletId with multiple admins creating wallets", async function () {
      // Admin 1 creates wallet
      const fundAmount1 = ethers.parseEther("1000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount1);
      await walletX.connect(admin).registerWallet("Admin1 Wallet", fundAmount1);
      const wallet1 = await walletX.connect(admin).getWalletAdmin();
      expect(wallet1.walletId).to.equal(1n);

      // Admin 2 (member) creates wallet
      const fundAmount2 = ethers.parseEther("2000");
      await mockERC20.transfer(member.address, fundAmount2);
      await mockERC20.connect(member).approve(await walletX.getAddress(), fundAmount2);
      await walletX.connect(member).registerWallet("Admin2 Wallet", fundAmount2);
      const wallet2 = await walletX.connect(member).getWalletAdmin();
      expect(wallet2.walletId).to.equal(2n);

      // Admin 3 (otherAccount) creates wallet
      const fundAmount3 = ethers.parseEther("3000");
      await mockERC20.transfer(otherAccount.address, fundAmount3);
      await mockERC20.connect(otherAccount).approve(await walletX.getAddress(), fundAmount3);
      await walletX.connect(otherAccount).registerWallet("Admin3 Wallet", fundAmount3);
      const wallet3 = await walletX.connect(otherAccount).getWalletAdmin();
      expect(wallet3.walletId).to.equal(3n);

      // Verify all wallets have unique IDs
      expect(wallet1.walletId).to.not.equal(wallet2.walletId);
      expect(wallet2.walletId).to.not.equal(wallet3.walletId);
      expect(wallet1.walletId).to.not.equal(wallet3.walletId);
    });
  });

  describe("Access Control & Security", function () {
    beforeEach(async function () {
      // Setup: Register a wallet for admin
      const walletName = "Test Organization";
      const fundAmount = ethers.parseEther("10000");
      await mockERC20.connect(admin).approve(await walletX.getAddress(), fundAmount);
      await walletX.connect(admin).registerWallet(walletName, fundAmount);
    });

    it("Should verify onlyAdmin modifier works for onboardMembers", async function () {
      await expect(
        walletX.connect(otherAccount).onboardMembers(
          member.address,
          "Test Member",
          ethers.parseEther("1000"),
          1n
        )
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should verify onlyAdmin modifier works for reimburseWallet", async function () {
      const reimbursementAmount = ethers.parseEther("1000");
      await mockERC20.connect(otherAccount).approve(await walletX.getAddress(), reimbursementAmount);

      await expect(
        walletX.connect(otherAccount).reimburseWallet(reimbursementAmount)
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should verify onlyAdmin modifier works for reimburseMember", async function () {
      await walletX.connect(admin).onboardMembers(
        member.address,
        "Test Member",
        ethers.parseEther("1000"),
        1n
      );

      await expect(
        walletX.connect(otherAccount).reimburseMember(1n, ethers.parseEther("500"))
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should verify onlyAdmin modifier works for getWalletAdmin", async function () {
      await expect(
        walletX.connect(otherAccount).getWalletAdmin()
      ).to.be.revertedWith("Not a wallet admin account");
    });

    it("Should verify onlyAdmin modifier works for getMembers", async function () {
      await expect(
        walletX.connect(otherAccount).getMembers()
      ).to.be.revertedWith("Not a wallet admin account");
    });
  });
});

