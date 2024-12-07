"use client";

import { useState, useEffect } from "react";
import { useContractRead, useContractWrite, useAccount } from "wagmi";
import { deployedContracts } from "~~/contracts/deployedContracts";
import { parseAbiItem } from "viem";

// Определяем тип для нашего контракта
type VotingSystemContract = {
  address: `0x${string}`;
  abi: any[];
};

export default function Home() {
  const { address } = useAccount();
  const [proposals, setProposals] = useState<any[]>([]);
  const [newProposal, setNewProposal] = useState("");

  const votingSystem: VotingSystemContract = {
    address: deployedContracts[31337].VotingSystem.address as `0x${string}`,
    abi: deployedContracts[31337].VotingSystem.abi,
  };

  const { data: proposalCount } = useContractRead({
    ...votingSystem,
    functionName: "getProposalsCount",
    watch: true,
  });

  const { write: createProposal } = useContractWrite({
    ...votingSystem,
    functionName: "createProposal" as const,
  });

  const { write: submitVote } = useContractWrite({
    ...votingSystem,
    functionName: "vote" as const,
  });

  const handleCreateProposal = async () => {
    if (!newProposal || !createProposal) return;
    try {
      createProposal({
        args: [newProposal],
      });
      setNewProposal("");
    } catch (error) {
      console.error("Error creating proposal:", error);
    }
  };

  const handleVote = async (proposalId: number) => {
    if (!submitVote) return;
    try {
      submitVote({
        args: [BigInt(proposalId)],
      });
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const fetchProposal = async (id: number) => {
    const { data } = await useContractRead({
      ...votingSystem,
      functionName: "getProposal",
      args: [BigInt(id)],
    });
    return data;
  };

  useEffect(() => {
    const fetchProposals = async () => {
      if (!proposalCount) return;

      const newProposals = [];
      for (let i = 0; i < Number(proposalCount); i++) {
        const proposal = await fetchProposal(i);
        if (proposal) {
          newProposals.push({
            id: i,
            description: proposal[0],
            voteCount: Number(proposal[1]),
            isActive: proposal[2],
            deadline: new Date(Number(proposal[3]) * 1000),
          });
        }
      }
      setProposals(newProposals);
    };

    fetchProposals();
  }, [proposalCount]);

  return (
      <main className="flex min-h-screen flex-col items-center p-8">
        <h1 className="text-4xl font-bold mb-8">Voting System</h1>

        <div className="w-full max-w-2xl space-y-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Create New Proposal</h2>
            <div className="flex gap-4">
              <input
                  type="text"
                  value={newProposal}
                  onChange={(e) => setNewProposal(e.target.value)}
                  placeholder="Enter proposal description"
                  className="flex-1 p-2 border rounded"
              />
              <button
                  onClick={handleCreateProposal}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Create
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Proposals</h2>
            {proposals.map((proposal) => (
                <div key={proposal.id} className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-xl font-medium">{proposal.description}</h3>
                  <div className="mt-2 space-y-2">
                    <p>Votes: {proposal.voteCount.toString()}</p>
                    <p>Status: {proposal.isActive ? "Active" : "Closed"}</p>
                    <p>Deadline: {proposal.deadline.toLocaleString()}</p>
                    {proposal.isActive && (
                        <button
                            onClick={() => handleVote(proposal.id)}
                            className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Vote
                        </button>
                    )}
                  </div>
                </div>
            ))}
          </div>
        </div>
      </main>
  );
}