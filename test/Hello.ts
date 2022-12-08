import { expect } from "chai";
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Hello, Hello__factory } from "../typechain-types";

chai.use(chaiAsPromised);

const setupEnvironment = async () => {
  const contractFactory: Hello__factory = await ethers.getContractFactory(
    "Hello"
  );

  const contract = (await contractFactory.deploy("Init")) as unknown as Hello;

  return {contract };
};

describe("Contract", () => {
  let contract: Hello;
  let deployer: SignerWithAddress, alice: SignerWithAddress;

  before(async () => {
    [deployer, alice] = await ethers.getSigners();
    const env = await setupEnvironment();
    contract = env.contract;
  });

  it("Should set a message", async () => {
    const initMessage = await contract.getMessage();
    expect(initMessage).to.equal("Init");
    await contract.setMessage("Hey there");
    const newMessage = await contract.getMessage();
    expect(newMessage).to.equal("Hey there");
  });
});