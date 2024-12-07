import { ethers } from 'hardhat';
import { expect } from 'chai';
import { Voting, Voting__factory } from '../typechain-types';

describe('Voting Contract', () => {
    let voting: Voting;
    let owner: any;
    let addr1: any;
    let addr2: any;

    beforeEach(async () => {
        const VotingFactory = await ethers.getContractFactory('Voting') as Voting__factory;
        [owner, addr1, addr2] = await ethers.getSigners();
        voting = await VotingFactory.deploy() as Voting;
        voting.waitForDeployment();
    });

    it('Должен добавить кандидата', async () => {
        await voting.addCandidate('Alice');
        const candidate = await voting.candidates(1);
        expect(candidate.id).to.equal(1);
        expect(candidate.name).to.equal('Alice');
        expect(candidate.voteCount).to.equal(0);
    });

    it('Должен позволить пользователю голосовать', async () => {
        await voting.addCandidate('Bob');
        await voting.connect(addr1).vote(1);
        const candidate = await voting.candidates(1);
        expect(candidate.voteCount).to.equal(1);
    });

    it('Должен предотвратить повторное голосование одним и тем же пользователем', async () => {
        await voting.addCandidate('Charlie');
        await voting.connect(addr1).vote(1);
        await expect(voting.connect(addr1).vote(1)).to.be.revertedWith('Вы уже проголосовали.');
    });

    it('Должен проверять корректность ID кандидата при голосовании', async () => {
        await expect(voting.vote(999)).to.be.revertedWith('Неверный ID кандидата.');
    });

    it('Должен возвращать информацию о кандидате', async () => {
        await voting.addCandidate('Diana');
        const [id, name, voteCount] = await voting.getCandidate(1);
        expect(id).to.equal(1);
        expect(name).to.equal('Diana');
        expect(voteCount).to.equal(0);
    });

    it('Должен правильно учитывать количество кандидатов', async () => {
        await voting.addCandidate('Eve');
        await voting.addCandidate('Frank');
        const count = await voting.candidatesCount();
        expect(count).to.equal(2);
    });

    it('Должен предотвращать голосование без кандидатов', async () => {
        await expect(voting.connect(addr1).vote(1)).to.be.revertedWith('Неверный ID кандидата.');
    });

    it('Должен разрешать нескольким пользователям голосовать за одного кандидата', async () => {
        await voting.addCandidate('Grace');
        await voting.connect(addr1).vote(1);
        await voting.connect(addr2).vote(1);
        const candidate = await voting.candidates(1);
        expect(candidate.voteCount).to.equal(2);
    });
});