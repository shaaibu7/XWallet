// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./interfaces/IERC20.sol";

contract WalletX {
    address tokenAddress;
    address owner;
    uint256 walletIdTrack = 1;

    struct Wallet {
        address adminAddress;
        string walletName;
        bool active;
        uint walletId;
        uint walletBalance;
        string role;
    }

    struct WalletMember {
        address memberAddress;
        address adminAddress;
        string organizationName;
        string name;
        bool active;
        uint256 spendLimit;
        uint256 memberIdentifier;
        string role;
    }

    struct memberTransaction {
        uint256 amount;
        address reciever;
    }

    mapping(address => Wallet) walletAdmin;
    mapping(address => WalletMember) walletMember;

    mapping(address => WalletMember[]) walletOrganisationMembers;
    mapping(address => memberTransaction[]) memberTransactions;

     modifier onlyAdmin {
        require(walletAdmin[msg.sender].active == true, "Not a wallet admin account");
        _;
    }

    constructor(address _tokenAddress) {
        tokenAddress = _tokenAddress;
        owner = msg.sender;
    }

    function registerWallet(
        string memory _walletName,
        uint256 _fundAmount
    ) external {
        require(
            walletAdmin[msg.sender].active != true,
            "Cannot create multiple wallets with one wallet address"
        );

        // fund escrow with funds
        uint256 allowance = IERC20(tokenAddress).allowance(
            msg.sender,
            address(this)
        );
        require(
            allowance >= _fundAmount,
            "No allowance to spend funds at the moment"
        );
        IERC20(tokenAddress).transferFrom(
            msg.sender,
            address(this),
            _fundAmount
        );

        Wallet memory walletOrganisation = Wallet({
            adminAddress: msg.sender,
            walletName: _walletName,
            active: true,
            walletId: walletIdTrack,
            walletBalance: _fundAmount,
            role: "admin"
        });

        walletIdTrack += 1;

        walletAdmin[msg.sender] = walletOrganisation;
    }

    // Getter functions

    function getWalletAdmin()
        external
        view
        onlyAdmin
        returns (Wallet memory admin)
    {
        admin = walletAdmin[msg.sender];
    }
}
