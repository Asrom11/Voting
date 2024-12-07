'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import VotingABI from '../../hardhat/artifacts/contracts/VotingContract.sol/VotingContract.json';
import {VotingContract} from "@se-2/hardhat/typechain-types";

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const VotingApp = () => {
  const [proposals, setProposals] = useState<{ name: string; voteCount: number }[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');
  const [votingEnded, setVotingEnded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    checkMetaMaskConnection();
  }, []);

  const checkMetaMaskConnection = async () => {
    if (!window.ethereum) {
      setErrorMessage('Пожалуйста, установите MetaMask.');
      return;
    }

    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        await fetchProposals();
        await checkVotingStatus();
        await verifyOwner(accounts[0]);
      }
    } catch (err) {
      console.error('Ошибка при подключении аккаунта:', err);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      setErrorMessage('Пожалуйста, установите MetaMask.');
      return;
    }

    try {
      const accounts: string[] = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setCurrentAccount(accounts[0]);
        await fetchProposals();
        await checkVotingStatus();
        await verifyOwner(accounts[0]);
      }
    } catch (err) {
      console.error('Ошибка при подключении кошелька:', err);
    }
  };

  const fetchProposals = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer) as VotingContract;
      const fetchedProposals = await contract.getProposals();

      const proposalsList = fetchedProposals.map((proposal) => ({
        name: proposal.name,
        voteCount: Number(proposal.voteCount),
      }));

      setProposals(proposalsList);
    } catch (err) {
      console.error('Ошибка при получении предложений:', err);
      setErrorMessage('Не удалось загрузить предложения.');
    }
  };

  const checkVotingStatus = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer) as VotingContract;
      const ended: boolean = await contract.votingEnded();
      setVotingEnded(ended);
    } catch (err) {
      console.error('Ошибка при проверке статуса голосования:', err);
    }
  };

  const verifyOwner = async (account: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer) as VotingContract;
      const owner: string = await contract.owner();
      if (owner.toLowerCase() === account.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error('Ошибка при проверке владельца:', err);
    }
  };

  const castVote = async (proposalIndex: any) => {
    if (votingEnded) {
      setErrorMessage('Голосование завершено.');
      return;
    }

    if (!window.ethereum) {
      setErrorMessage('Пожалуйста, установите MetaMask.');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer) as VotingContract;
      const tx = await contract.vote(proposalIndex);
      await tx.wait();
      await fetchProposals();
    } catch (err: any) {
      if (err.data && err.data.message) {
        setErrorMessage(err.data.message);
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Произошла ошибка при голосовании.');
      }
      console.error('Ошибка при голосовании:', err);
    }
  };

  const endVoting = async () => {
    if (!isOwner) {
      setErrorMessage('Только владелец может завершить голосование.');
      return;
    }

    if (!window.ethereum) {
      setErrorMessage('Пожалуйста, установите MetaMask.');
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, VotingABI.abi, signer) as VotingContract;
      const tx = await contract.endVoting();
      await tx.wait();
      setVotingEnded(true);
    } catch (err: any) {
      if (err.data && err.data.message) {
        setErrorMessage(err.data.message);
      } else if (err.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Произошла ошибка при завершении голосования.');
      }
      console.error('Ошибка при завершении голосования:', err);
    }
  };

  return (
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Децентрализованное Голосование</h1>
        {currentAccount ? (
            <>
              <p>Подключенный аккаунт: {currentAccount}</p>
              {isOwner && !votingEnded && (
                  <button onClick={endVoting} style={{ marginBottom: '20px' }}>
                    Завершить голосование
                  </button>
              )}
              {votingEnded && <p>Голосование завершено.</p>}
              <h2>Список Предложений</h2>
              <ul>
                {proposals.map((proposal, index) => (
                    <li key={index} style={{ marginBottom: '10px' }}>
                      <strong>{proposal.name}</strong> - Голоса: {proposal.voteCount}
                      {!votingEnded && (
                          <button
                              onClick={() => castVote(index)}
                              style={{ marginLeft: '10px' }}
                          >
                            Голосовать
                          </button>
                      )}
                    </li>
                ))}
              </ul>
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </>
        ) : (
            <button onClick={connectWallet}>Подключить Кошелек</button>
        )}
      </div>
  );
};

export default VotingApp;