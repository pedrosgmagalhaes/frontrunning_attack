# Front-running Attack Simulation with Hardhat

This repository contains a simplified demonstration of a front-running attack on the Ethereum network. We are using the [Hardhat](https://hardhat.org/) Ethereum development environment for this simulation.

## Overview

In Ethereum, front-running is a type of attack where a malicious entity tries to benefit from seeing another person's transaction details before that transaction is confirmed. The attacker can then issue their own transaction with a higher gas price, making it more likely for miners to include the attacker's transaction in the next block, thus getting processed before the victim's transaction.

In our simulation, we consider a scenario where a malicious user front-runs a regular user's transaction to change a shared state in a contract, which prevents the regular user's transaction from being processed.

## Contract

The contract `FrontRunningDemo` is quite simple:

```solidity
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

```

It holds a state (a number) and allows users to submit a transaction that changes the state. However, any transaction with an amount smaller than or equal to the current state will be rejected.

## Test
Our test simulates the attack scenario:

```javascript
it("should execute a front-running attack", async function () {
    // User A prepares a transaction
    const ownerAmount = ethers.utils.parseUnits("20", "ether");

    // Attacker B observes User A's transaction and prepares their own transaction
    const attackerAmount = ethers.utils.parseUnits("100", "ether");

    // Attacker B front-runs User A
    await frontRunningDemo.connect(attacker).submitTransaction(attackerAmount);

    // User A submits their transaction, which should fail
    try {
        await frontRunningDemo.connect(owner).submitTransaction(ownerAmount);
        throw new Error("Owner's transaction did not fail as expected");
    } catch (error) {
        if (error.message.includes("Owner's transaction did not fail as expected")) {
            throw error;
        } else {
            console.log("Owner's transaction failed as expected");
        }
    }

    // Check order of transactions
    const transactions = await frontRunningDemo.getTransactions();
    expect(transactions.length).to.equal(1);
    expect(transactions[0].user).to.equal(attackerAddress); // Only attacker's transaction should have succeeded
    expect(transactions[0].amount.toString()).to.equal(attackerAmount.toString());
});
```

It holds a state (a number) and allows users to submit a transaction that changes the state. However, any transaction with an amount smaller than or equal to the current state will be rejected.

This test simulates a front-running attack in the Hardhat local environment. The attacker observes the regular user's transaction and front-runs it by submitting their own transaction first. The regular user's transaction fails as it doesn't meet the contract's requirement.

