require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../backend/.env" });

module.exports = {
  solidity: "0.8.19",
  networks: {
    monad: {
      url: process.env.MONAD_RPC_URL,
      accounts: [`0x${process.env.PRIVATE_KEY}`],
      chainId: 10143,
    },
  },
};