const hre = require("hardhat");

async function main() {
  console.log("Deploying AgentMemory to Monad testnet...");

  const AgentMemory = await hre.ethers.getContractFactory("AgentMemory");
  const contract = await AgentMemory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✓ AgentMemory deployed to:", address);
  console.log("→ Copy this address into backend/.env as CONTRACT_ADDRESS");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});