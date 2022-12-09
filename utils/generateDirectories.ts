import path from "path";
import fs from "fs";
import prompts from "prompts";
import { ToWords } from 'to-words';
const toWords = new ToWords();

const getDayFromUser = async () => {
    const response = await prompts({
        type: "number",
        name: "day",
        message: "What day do you want to create? e.g. Dec 3rd = 3, etc",
        validate: value => value > 0 && value < 26,
    });

    return response;
};

const generateDayDirectory = async (day: number) => {
    const dayDir = `${path.dirname("")}/days/${day}/`;

    // check it doesn't exist so we don't clear it
    if (fs.existsSync(dayDir)) throw new Error("This day has already been initiated");

    // create day directory
    fs.mkdirSync(dayDir);

    // create empty input.txt
    fs.writeFileSync(`${dayDir}/input.txt`, "");

    console.log("Generated day directory.")
}

const generateContract = async (day: number) => {
    const contractDir = `${path.dirname("")}/contracts/`;

    // Convert day input to word format
    let currentDay = toWords.convert(day);

    // Remove spaces
    currentDay.replace(" ", "");

    // check it doesn't exist so we don't clear it
    if (fs.existsSync(`${contractDir}/Day${currentDay}.sol`)) throw new Error("This day has already been initiated");

    const newContractContent = `// SPDX-License-Identifier: UNLICENSED
    pragma solidity ^0.8.9;
    
    contract Day${currentDay} {
        constructor() {}
    }`

    // create contract file
    fs.writeFileSync(`${contractDir}/Day${currentDay}.sol`, newContractContent);

    console.log("Generated contract");
}

const generateDeploymentScript = async (day: number) => {
    let deployFilePath;

    // Convert day input to word format
    let currentDay = toWords.convert(day);

    // Remove spaces
    currentDay.replace(" ", "");

    if (day < 10) {
        deployFilePath = `${path.dirname("")}/deploy/00${day}_day${currentDay}.ts`;
    } else {
        deployFilePath = `${path.dirname("")}/deploy/0${day}_day${currentDay}.ts`
    }

    // check it doesn't exist so we don't clear it
    if (fs.existsSync(deployFilePath)) throw new Error("This day has already been initiated");

    const newFileContent = `import { HardhatRuntimeEnvironment } from "hardhat/types";
    import { DeployFunction } from "hardhat-deploy/types";
    
    const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
      
      const { deployments, getNamedAccounts } = hre;
      const { deploy } = deployments;
      const { deployer } = await getNamedAccounts();
      
      const contract = await deploy("Day${currentDay}", {
        from: deployer,
        log: true
      });
    };
    
    export default func;
    func.tags = ["testbed", "_day${currentDay}"];`

    // create contract file
    fs.writeFileSync(deployFilePath, newFileContent);

    console.log("Generated deploy script");
}

const generateUnitTest = async (day: number) => {
    // Convert day input to word format
    let currentDay = toWords.convert(day);

    // Remove spaces
    currentDay.replace(" ", "");

    const unitTestPath = `${path.dirname("")}/test/Day${currentDay}.ts`;

    // check it doesn't exist so we don't clear it
    if (fs.existsSync(unitTestPath)) throw new Error("This day has already been initiated");

    const newFileContent = `import chai from "chai";
    import chaiAsPromised from "chai-as-promised";
    import { ethers } from "hardhat";
    import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
    import { Day${currentDay}, Day${currentDay}__factory } from "../typechain-types";
    import { getFileContent } from "../utils/testHelpers";
    
    chai.use(chaiAsPromised);
    
    const setupEnvironment = async () => {
      const contractFactory: Day${currentDay}__factory = await ethers.getContractFactory(
        "Day${currentDay}"
      );
    
      const contract = (await contractFactory.deploy()) as unknown as Day${currentDay};
    
      return { contract };
    };
    
    describe("Day ${currentDay}", () => {
      let contract: Day${currentDay};
      let deployer: SignerWithAddress, alice: SignerWithAddress;
    
      before(async () => {
        [deployer, alice] = await ethers.getSigners();
        const env = await setupEnvironment();
        contract = env.contract;
      });
    
      it("Should...", async () => {
        
      });
    });`

    // create contract file
    fs.writeFileSync(unitTestPath, newFileContent);

    console.log("Generated unit tests script");
}

const runner = async () => {
    const { day } = await getDayFromUser();
    console.log(day);

    console.log(
        "Details Confirmed! Generating files..."
    );

    await generateDayDirectory(day);
    await generateContract(day);
    await generateDeploymentScript(day);
    await generateUnitTest(day);

    console.log(`Directories generated for Day ${day}`);
};

runner();