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
});

