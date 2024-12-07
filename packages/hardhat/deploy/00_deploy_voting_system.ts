import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';

const deployVoting: DeployFunction = async (hre: HardhatRuntimeEnvironment) => {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;

    const { deployer } = await getNamedAccounts();

    const voting = await deploy('Voting', {
        from: deployer,
        args: [],
        log: true,
    });

    console.log("Развернули смарт контракрт по адрессу:", voting.address);
};

export default deployVoting;
deployVoting.tags = ['Voting'];