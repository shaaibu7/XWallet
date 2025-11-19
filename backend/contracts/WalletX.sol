// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract WalletX {
  address tokenAddress;
  address owner;

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

    mapping (address => Wallet) walletAdmin;
    mapping (address => WalletMember) walletMember;

    mapping (address => WalletMember[]) walletOrganisationMembers;
    mapping (address => memberTransaction[]) memberTransactions; 


  constructor(address _tokenAddress) {
    tokenAddress = _tokenAddress;
    owner = msg.sender;
  }

}
