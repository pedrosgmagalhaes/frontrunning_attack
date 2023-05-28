const { expect } = require("chai");

describe("FrontRunningDemo", function () {
    let frontRunningDemo;
    let owner;
    let attacker;
    let ownerAddress;
    let attackerAddress;

    beforeEach(async function () {
        [owner, attacker] = await ethers.getSigners();

        const FrontRunningDemo = await ethers.getContractFactory("FrontRunningDemo");
        frontRunningDemo = await FrontRunningDemo.deploy();
        await frontRunningDemo.deployed();

        ownerAddress = await owner.getAddress();
        attackerAddress = await attacker.getAddress();
    });

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

});

