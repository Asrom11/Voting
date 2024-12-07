import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VotingSystem", function () {
    let votingSystem: any;
    let owner: SignerWithAddress;
    let voter1: SignerWithAddress;
    let voter2: SignerWithAddress;

    beforeEach(async function () {
        [owner, voter1, voter2] = await ethers.getSigners();

        const VotingSystemFactory = await ethers.getContractFactory("VotingSystem", owner);
        votingSystem = await VotingSystemFactory.deploy();
        await votingSystem.deployed();
    });

    describe("Proposal Creation", function () {
        it("should allow owner to create proposal", async function () {
            const tx = await votingSystem.connect(owner).createProposal("Test Proposal");
            await tx.wait();

            const [description, voteCount, isActive, deadline] = await votingSystem.getProposal(0);
            expect(description).to.equal("Test Proposal");
        });

        it("should not allow non-owner to create proposal", async function () {
            await expect(
                votingSystem.connect(voter1).createProposal("Test Proposal")
            ).to.be.revertedWithCustomError(votingSystem, "OwnableUnauthorizedAccount");
        });
    });

    describe("Voting", function () {
        beforeEach(async function () {
            const tx = await votingSystem.connect(owner).createProposal("Test Proposal");
            await tx.wait();
        });

        it("should allow voting", async function () {
            const tx = await votingSystem.connect(voter1).vote(0);
            await tx.wait();

            const [, voteCount,,] = await votingSystem.getProposal(0);
            expect(voteCount).to.equal(1);
        });

        it("should not allow double voting", async function () {
            const tx = await votingSystem.connect(voter1).vote(0);
            await tx.wait();

            await expect(
                votingSystem.connect(voter1).vote(0)
            ).to.be.revertedWith("Already voted");
        });
    });
});