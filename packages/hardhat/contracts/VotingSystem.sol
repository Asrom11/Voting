// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    // Мэппинг для хранения кандидатов
    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    // Мэппинг для учета проголосовавших адресов
    mapping(address => bool) public voters;

    // События
    event CandidateAdded(uint indexed id, string name);
    event Voted(address indexed voter, uint indexed candidateId);

    // Функция для добавления кандидата
    function addCandidate(string memory _name) public {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    // Функция для голосования
    function vote(uint _candidateId) public {
        require(!voters[msg.sender], unicode"Вы уже проголосовали.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, unicode"Неверный ID кандидата.");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(msg.sender, _candidateId);
    }

    // Получение информации о кандидате
    function getCandidate(uint _candidateId) public view returns (uint, string memory, uint) {
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.id, candidate.name, candidate.voteCount);
    }
}