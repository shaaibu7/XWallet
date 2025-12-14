import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import "@nomicfoundation/hardhat-verify";
import { configVariable } from "hardhat/config";

import dotenv from "dotenv";

dotenv.config();


const config: HardhatUserConfig = {
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    mainnet: {
      type: "http",
      chainType: "l1",
      url: configVariable("CELO_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
      chainId: 42220,
    },
    celo: {
      type: "http",
      chainType: "l1",
      url: configVariable("CELO_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
      chainId: 42220,
    },
    base: {
      type: "http",
      chainType: "l1",
      url: configVariable("BASE_RPC_URL"),
      accounts: [configVariable("PRIVATE_KEY")],
      chainId: 8453,
    },
  },
  etherscan: {
    apiKey: {
      base: configVariable("BASESCAN_API_KEY"),
      celo: configVariable("CELOSCAN_API_KEY"),
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "celo",
        chainId: 42220,
        urls: {
          apiURL: "https://api.celoscan.io/api",
          browserURL: "https://celoscan.io",
        },
      },
    ],
  },
};

export default config;
