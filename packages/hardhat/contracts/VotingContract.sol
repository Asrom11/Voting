// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingContract {
    struct Proposal {
        string name;
        uint voteCount;
    }

    address public owner;
    mapping(address => bool) public voters;
    Proposal[] public proposals;
    bool public votingEnded;

    event Voted(address indexed voter, uint proposalIndex);
    event VotingEnded();

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier votingActive() {
        require(!votingEnded, "Vote has ended");
        _;
    }

    constructor(string[] memory proposalNames) {
        owner = msg.sender;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({name: proposalNames[i], voteCount: 0}));
        }
    }

    function vote(uint proposalIndex) public votingActive {
        require(!voters[msg.sender], "You have already voted");
        require(proposalIndex < proposals.length, "Invalid proposal index");

        voters[msg.sender] = true;
        proposals[proposalIndex].voteCount += 1;

        emit Voted(msg.sender, proposalIndex);
    }

    function endVoting() public onlyOwner votingActive {
        votingEnded = true;
        emit VotingEnded();
    }

    function getProposals() public view returns (Proposal[] memory) {
        return proposals;
    }
}