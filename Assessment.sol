// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address public owner;
    uint public totalDonations;

    event DonationMade(address indexed donor, uint amount);
    event GrantRequested(address indexed requester, uint amount);

    constructor() {
        owner = msg.sender; // The account deploying the contract becomes the owner
    }

    // Allow users to donate Ether to the contract
    function donate() public payable {
        require(msg.value > 0, "Donation must be greater than 0");
        totalDonations += msg.value;

        emit DonationMade(msg.sender, msg.value);
    }

    // Allow users to request a grant (withdraw Ether) if conditions are met
    function requestGrant(uint amount) public {
        require(amount > 0, "Grant amount must be greater than 0");
        require(amount <= address(this).balance, "Not enough funds in the contract");

        totalDonations -= amount;
        payable(msg.sender).transfer(amount);

        emit GrantRequested(msg.sender, amount);
    }

    // Check the current balance of the contract
    function getBalance() public view returns (uint) {
        return address(this).balance;
    }
}