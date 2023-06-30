
import chai from "chai";
import { solidity } from "ethereum-waffle";
import { Blockchain } from "../common";
import { ethers } from "hardhat";

chai.use(solidity);

const provider = ethers.provider;

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
