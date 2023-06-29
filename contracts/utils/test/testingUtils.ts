
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Blockchain } from "../common";
import { JsonRpcProvider } from "ethers";

chai.use(solidity);

const provider = new JsonRpcProvider();

// HARDHAT / WAFFLE
export const getWaffleExpect = (): Chai.ExpectStatic => {
  return chai.expect;
};

export const addSnapshotBeforeRestoreAfterEach = () => {
  const blockchain = new Blockchain(provider);
  beforeEach(async () => {
    await blockchain.saveSnapshotAsync();
  });

  afterEach(async () => {
    await blockchain.revertAsync();
  });
};
