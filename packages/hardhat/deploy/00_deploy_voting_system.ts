import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployVotingSystem: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  await deploy("VotingSystem", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  const votingSystem = await hre.ethers.getContract("VotingSystem", deployer);
  console.log("VotingSystem deployed to:", votingSystem.getAddress());
};

export default deployVotingSystem;
deployVotingSystem.tags = ["VotingSystem"];