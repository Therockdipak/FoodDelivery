const { ethers } = require("hardhat");

async function main() {
  const name = "PizzaDelivery";
  const contract = await ethers.deployContract(name, []);
  await contract.waitForDeployment();

  console.log(`PizzaDelivery deployed at ${contract.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// 0x5FbDB2315678afecb367f032d93F642f64180aa3