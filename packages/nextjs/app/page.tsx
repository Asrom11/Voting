'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Voting from '../../hardhat/artifacts/contracts/YourContract.sol/Voting.json';

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function HomePage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [candidateName, setCandidateName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [currentAccount, setCurrentAccount] = useState('');

  // Проверка подключения к MetaMask
  useEffect(() => {
    if (!window.ethereum) {
      setErrorMessage('Установите MetaMask.');
    } else {
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setCurrentAccount(accounts[0]);
          loadCandidates();
        }
      });
    }
  }, []);

  // Загрузка списка кандидатов
  async function loadCandidates() {
    if (typeof window.ethereum !== 'undefined') {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, Voting.abi, signer);
      try {
        const candidatesCount = await contract.candidatesCount();
        const candidatesArray = [];
        for (let i = 1; i <= Number(candidatesCount); i++) {
          const candidate = await contract.getCandidate(i);
          candidatesArray.push({
            id: Number(candidate[0]),
            name: candidate[1],
            voteCount: Number(candidate[2]),
          });
        }
        setCandidates(candidatesArray);
      } catch (err) {
        console.error('Ошибка при загрузке кандидатов:', err);
      }
    }
  }

  // Добавление нового кандидата
  async function addCandidate() {
    if (!candidateName) return;
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, Voting.abi, signer);
        const transaction = await contract.addCandidate(candidateName);
        await transaction.wait();
        setCandidateName('');
        loadCandidates();
      } catch (err) {
        console.error('Ошибка при добавлении кандидата:', err);
      }
    }
  }

  // Голосование за кандидата
  async function vote(candidateId: number) {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, Voting.abi, signer);
        const transaction = await contract.vote(candidateId);
        await transaction.wait();
        loadCandidates();
      } catch (err: any) {
        if (err.info && err.info.error && err.info.error.message) {
          setErrorMessage(err.info.error.message);
        } else {
          console.error('Ошибка при голосовании:', err);
        }
      }
    }
  }

  return (
      <div>
        <h1>Децентрализованное голосование</h1>
        {currentAccount ? (
            <>
              <div>
                <input
                    type="text"
                    placeholder="Имя кандидата"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                />
                <button onClick={addCandidate}>Добавить кандидата</button>
              </div>
              <h2>Список кандидатов</h2>
              <ul>
                {candidates.map((candidate) => (
                    <li key={candidate.id}>
                      <b>{candidate.name}</b> (Голоса: {candidate.voteCount})
                      <button onClick={() => vote(candidate.id)}>Голосовать</button>
                    </li>
                ))}
              </ul>
              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            </>
        ) : (
            <button onClick={() => window.ethereum.request({ method: 'eth_requestAccounts' })}>
              Подключить кошелек
            </button>
        )}
      </div>
  );
}