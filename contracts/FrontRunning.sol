// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FrontRunningDemo {
    struct Transaction {
        address user;
        uint256 amount;
    }

    Transaction[] public transactions;

    uint256 public state = 0;

    function submitTransaction(uint256 amount) external {
        require(amount > state, "Amount must be larger than current state");

        transactions.push(Transaction(msg.sender, amount));
        state = amount;
    }

    function getTransactions() external view returns (Transaction[] memory) {
        return transactions;
    }
}
