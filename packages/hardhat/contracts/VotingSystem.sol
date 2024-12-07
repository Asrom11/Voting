// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

contract VotingSystem is Ownable {
    struct Proposal {
        string description;
        uint256 voteCount;
        bool isActive;
        uint256 deadline;
    }

    struct Voter {
        bool hasVoted;
        uint256 votedProposalId;
    }

    Proposal[] public proposals;
    mapping(address => mapping(uint256 => Voter)) public voters;
    uint256 public votingDuration = 3 days;

    event ProposalCreated(uint256 indexed proposalId, string description, uint256 deadline);
    event Voted(address indexed voter, uint256 indexed proposalId);
    event ProposalStatusChanged(uint256 indexed proposalId, bool isActive);

    constructor() Ownable(msg.sender) {}

    function createProposal(string memory _description) external onlyOwner {
        uint256 deadline = block.timestamp + votingDuration;
        proposals.push(Proposal({
            description: _description,
            voteCount: 0,
            isActive: true,
            deadline: deadline
        }));

        emit ProposalCreated(proposals.length - 1, _description, deadline);
    }

    function vote(uint256 _proposalId) external {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        require(proposals[_proposalId].isActive, "Proposal is not active");
        require(block.timestamp < proposals[_proposalId].deadline, "Voting period has ended");
        require(!voters[msg.sender][_proposalId].hasVoted, "Already voted");

        voters[msg.sender][_proposalId].hasVoted = true;
        voters[msg.sender][_proposalId].votedProposalId = _proposalId;
        proposals[_proposalId].voteCount++;

        emit Voted(msg.sender, _proposalId);
    }

    function getProposal(uint256 _proposalId) external view returns (
        string memory description,
        uint256 voteCount,
        bool isActive,
        uint256 deadline
    ) {
        require(_proposalId < proposals.length, "Invalid proposal ID");
        Proposal memory proposal = proposals[_proposalId];
        return (
            proposal.description,
            proposal.voteCount,
            proposal.isActive,
            proposal.deadline
        );
    }

    function getProposalsCount() external view returns (uint256) {
        return proposals.length;
    }

    function setVotingDuration(uint256 _duration) external onlyOwner {
        votingDuration = _duration;
    }
}