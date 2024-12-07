import { ethers } from 'hardhat';
import { expect } from 'chai';
import { VotingContract, VotingContract__factory } from "../typechain-types";

describe('VotingContract', () => {
    let voting: VotingContract;
    let owner: any;
    let addr1: any;
    let addr2: any;
    const proposalNames = ["Option A", "Option B", "Option C"];

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        const VotingFactory: VotingContract__factory = await ethers.getContractFactory('VotingContract');
        voting = await VotingFactory.deploy(proposalNames);
        await voting.waitForDeployment();
    });

    it('Должен установить владельца при деплое', async () => {
        expect(await voting.owner()).to.equal(owner.address);
    });

    it('Должен инициализировать предложения через конструктор', async () => {
        const proposals = await voting.getProposals();
        expect(proposals.length).to.equal(proposalNames.length);
        for (let i = 0; i < proposals.length; i++) {
            expect(proposals[i].name).to.equal(proposalNames[i]);
            expect(proposals[i].voteCount).to.equal(0);
        }
    });

    it('Должен позволить пользователю голосовать за действительное предложение', async () => {
        await expect(voting.connect(addr1).vote(0))
            .to.emit(voting, 'Voted')
            .withArgs(addr1.address, 0);

        const proposals = await voting.getProposals();
        expect(proposals[0].voteCount).to.equal(1);
    });

    it('Должен предотвратить повторное голосование одним и тем же пользователем', async () => {
        await voting.connect(addr1).vote(1);
        await expect(voting.connect(addr1).vote(1)).to.be.revertedWith('You have already voted');
    });

    it('Должен проверять корректность ID предложения при голосовании', async () => {
        await expect(voting.connect(addr1).vote(999)).to.be.revertedWith('Invalid proposal index');
    });

    it('Должен предотвращать голосование после завершения голосования', async () => {
        await voting.connect(owner).endVoting();
        await expect(voting.connect(addr1).vote(0)).to.be.revertedWith('Vote has ended');
    });

    it('Только владелец может завершить голосование', async () => {
        await expect(voting.connect(addr1).endVoting()).to.be.revertedWith('Only owner can call this function');
    });

    it('Должен эмитировать событие VotingEnded после завершения голосования', async () => {
        await expect(voting.connect(owner).endVoting())
            .to.emit(voting, 'VotingEnded');

        expect(await voting.votingEnded()).to.equal(true);
    });

    it('Должен позволить нескольким пользователям голосовать за одного кандидата', async () => {
        await voting.connect(addr1).vote(2);
        await voting.connect(addr2).vote(2);

        const proposals = await voting.getProposals();
        expect(proposals[2].voteCount).to.equal(2);
    });

    it('Должен предотвращать голосование с несуществующим индексом предложения', async () => {
        // Предполагая, что предложений 3, индексы 0,1,2
        await expect(voting.connect(addr1).vote(3)).to.be.revertedWith('Invalid proposal index');
    });
});