/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    VotingContract: {
      address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      abi: [
        {
          inputs: [
            {
              internalType: "string[]",
              name: "proposalNames",
              type: "string[]",
            },
          ],
          stateMutability: "nonpayable",
          type: "constructor",
        },
        {
          anonymous: false,
          inputs: [
            {
              indexed: true,
              internalType: "address",
              name: "voter",
              type: "address",
            },
            {
              indexed: false,
              internalType: "uint256",
              name: "proposalIndex",
              type: "uint256",
            },
          ],
          name: "Voted",
          type: "event",
        },
        {
          anonymous: false,
          inputs: [],
          name: "VotingEnded",
          type: "event",
        },
        {
          inputs: [],
          name: "endVoting",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [],
          name: "getProposals",
          outputs: [
            {
              components: [
                {
                  internalType: "string",
                  name: "name",
                  type: "string",
                },
                {
                  internalType: "uint256",
                  name: "voteCount",
                  type: "uint256",
                },
              ],
              internalType: "struct VotingContract.Proposal[]",
              name: "",
              type: "tuple[]",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "owner",
          outputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "",
              type: "uint256",
            },
          ],
          name: "proposals",
          outputs: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "voteCount",
              type: "uint256",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "uint256",
              name: "proposalIndex",
              type: "uint256",
            },
          ],
          name: "vote",
          outputs: [],
          stateMutability: "nonpayable",
          type: "function",
        },
        {
          inputs: [
            {
              internalType: "address",
              name: "",
              type: "address",
            },
          ],
          name: "voters",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
        {
          inputs: [],
          name: "votingEnded",
          outputs: [
            {
              internalType: "bool",
              name: "",
              type: "bool",
            },
          ],
          stateMutability: "view",
          type: "function",
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
