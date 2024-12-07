import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const deployVoting: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    const proposalNames = ["Option A", "Option B", "Option C"];

    const voting = await deploy('VotingContract', {
        from: deployer,
        args: [proposalNames],
        log: true,
    });

    console.log("VotingContract deployed to:", voting.address);
};

deployVoting.tags = ['Voting'];

export default deployVoting;