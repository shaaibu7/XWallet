// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

contract WalletX {
  address tokenAddress;
  address owner;

  constructor(address _tokenAddress) {
    tokenAddress = _tokenAddress;
    owner = msg.sender;
  }

}
