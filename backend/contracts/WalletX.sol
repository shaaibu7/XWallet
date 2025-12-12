// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "./interfaces/IERC20.sol";
import "./lib/errors.sol";

contract WalletX {
    address tokenAddress;
    address owner;
    uint256 walletIdTrack = 1;

    // Events
    event MemberOnboarded(address indexed admin, address indexed member, string name, uint256 spendLimit);
    event MemberRemoved(address indexed admin, address indexed member, uint256 refundAmount);
    event MemberWithdrawal(address indexed member, address indexed receiver, uint256 amount);
    event WalletRegistered(address indexed admin, string walletName, uint256 initialBalance);
    event MemberFrozen(address indexed admin, address indexed member);
    event MemberUnfrozen(address indexed admin, address indexed member);

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
        bool frozen;
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
        
        emit WalletRegistered(msg.sender, _walletName, _fundAmount);
    }

    function onboardMembers(address _memberAddress, string memory _memberName, uint256 _fundAmount, uint256 _memberIdentifier) onlyAdmin external {
        string memory _organizationName = walletAdmin[msg.sender].walletName;
        uint walletBalance = walletAdmin[msg.sender].walletBalance;

        if (walletBalance < _fundAmount) {
            revert Error.InsufficientFunds();
        }

        
        WalletMember memory member = WalletMember({
            memberAddress: _memberAddress,
            adminAddress: msg.sender,
            organizationName: _organizationName,
            name: _memberName,
            active: true,
            frozen: false,
            spendLimit: _fundAmount,
            memberIdentifier: _memberIdentifier,
            role: "member"
        });

        walletMember[_memberAddress] = member;
        walletOrganisationMembers[msg.sender].push(member);
        
        emit MemberOnboarded(msg.sender, _memberAddress, _memberName, _fundAmount);

    }

    function reimburseWallet(uint256 _amount) external onlyAdmin {
        // fund escrow with funds
        uint256 allowance = IERC20(tokenAddress).allowance(msg.sender, address(this));
        require(allowance >= _amount, "No allowance to spend funds at the moment");
        IERC20(tokenAddress).transferFrom(msg.sender, address(this), _amount);


        walletAdmin[msg.sender].walletBalance += _amount;

    }

     function reimburseMember(uint256 _memberIdentifier, uint256 _amount) external onlyAdmin {

        uint walletBalance = walletAdmin[msg.sender].walletBalance;

        if (walletBalance < _amount) {
            revert Error.InsufficientFunds();
        }

        WalletMember[] storage members = walletOrganisationMembers[msg.sender];

        for(uint256 i = 0; i < members.length; i++) {
            if (members[i].memberIdentifier == _memberIdentifier && members[i].active && !members[i].frozen) {
                members[i].spendLimit += _amount;
                walletMember[members[i].memberAddress].spendLimit += _amount;
                walletAdmin[msg.sender].walletBalance -= _amount;
                break;
            }
        }
    }


    function memberWithdrawal(uint256 _amount, address _receiver) external {
        WalletMember storage member = walletMember[msg.sender];
        require(member.active, "Member account is not active");
        require(!member.frozen, "Member account is frozen");
        require(member.spendLimit >= _amount, "Insufficient spend limit");
        
        // Update member spend limit
        member.spendLimit -= _amount;
        
        // Update member in organization array
        WalletMember[] storage orgMembers = walletOrganisationMembers[member.adminAddress];
        for(uint256 i = 0; i < orgMembers.length; i++) {
            if(orgMembers[i].memberAddress == msg.sender) {
                orgMembers[i].spendLimit -= _amount;
                break;
            }
        }
        
        // Record transaction
        memberTransactions[msg.sender].push(memberTransaction({
            amount: _amount,
            reciever: _receiver
        }));
        
        // Transfer tokens
        bool success = IERC20(tokenAddress).transfer(_receiver, _amount);
        require(success, "Token transfer failed");
        
        emit MemberWithdrawal(msg.sender, _receiver, _amount);
    }

    function removeMember(address _memberAddress) external onlyAdmin {
        WalletMember storage member = walletMember[_memberAddress];
        require(member.active, "Member is not active or does not exist");
        require(member.adminAddress == msg.sender, "Not authorized to remove this member");
        
        // Calculate refund amount (unused spend limit)
        uint256 refundAmount = member.spendLimit;
        
        // Deactivate member
        member.active = false;
        member.spendLimit = 0;
        
        // Update organization member array
        WalletMember[] storage orgMembers = walletOrganisationMembers[msg.sender];
        for(uint256 i = 0; i < orgMembers.length; i++) {
            if(orgMembers[i].memberAddress == _memberAddress) {
                orgMembers[i].active = false;
                orgMembers[i].spendLimit = 0;
                break;
            }
        }
        
        // Return unused funds to organization wallet
        if(refundAmount > 0) {
            walletAdmin[msg.sender].walletBalance += refundAmount;
        }
        
        emit MemberRemoved(msg.sender, _memberAddress, refundAmount);
    }

    function freezeMember(address _memberAddress) external onlyAdmin {
        WalletMember storage member = walletMember[_memberAddress];
        require(member.active, "Member is not active or does not exist");
        require(member.adminAddress == msg.sender, "Not authorized to freeze this member");
        require(!member.frozen, "Member is already frozen");
        
        // Freeze member
        member.frozen = true;
        
        // Update organization member array
        WalletMember[] storage orgMembers = walletOrganisationMembers[msg.sender];
        for(uint256 i = 0; i < orgMembers.length; i++) {
            if(orgMembers[i].memberAddress == _memberAddress) {
                orgMembers[i].frozen = true;
                break;
            }
        }
        
        emit MemberFrozen(msg.sender, _memberAddress);
    }

    function unfreezeMember(address _memberAddress) external onlyAdmin {
        WalletMember storage member = walletMember[_memberAddress];
        require(member.active, "Member is not active or does not exist");
        require(member.adminAddress == msg.sender, "Not authorized to unfreeze this member");
        require(member.frozen, "Member is not frozen");
        
        // Unfreeze member
        member.frozen = false;
        
        // Update organization member array
        WalletMember[] storage orgMembers = walletOrganisationMembers[msg.sender];
        for(uint256 i = 0; i < orgMembers.length; i++) {
            if(orgMembers[i].memberAddress == _memberAddress) {
                orgMembers[i].frozen = false;
                break;
            }
        }
        
        emit MemberUnfrozen(msg.sender, _memberAddress);
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

     // fetch admin role for frontend op
    function getAdminRole(address _userAddress) external view returns(string memory userRole) {
        userRole = walletAdmin[_userAddress].role;

    }

     function getMembers() onlyAdmin() external view returns(WalletMember[] memory members) {
        members = walletOrganisationMembers[msg.sender];
    }

    function getActiveMembers() onlyAdmin() external view returns(WalletMember[] memory activeMembers) {
        WalletMember[] memory allMembers = walletOrganisationMembers[msg.sender];
        uint256 activeCount = 0;
        
        // Count active members
        for(uint256 i = 0; i < allMembers.length; i++) {
            if(allMembers[i].active) {
                activeCount++;
            }
        }
        
        // Create array of active members
        activeMembers = new WalletMember[](activeCount);
        uint256 index = 0;
        for(uint256 i = 0; i < allMembers.length; i++) {
            if(allMembers[i].active) {
                activeMembers[index] = allMembers[i];
                index++;
            }
        }
    }

    function getMember() external view returns(WalletMember memory member) {
        member = walletMember[msg.sender];
    }

     function getMemberTransactions(address _memberAddress) external view returns(memberTransaction[] memory memberTxs) {
        memberTxs = memberTransactions[_memberAddress];
    }

    
}
