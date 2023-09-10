const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("BridgeContract", function () {
  let MasterContract, BridgeContract, masterContract, bridgeContract, deployer, issuer, verifier, other;
  const tokenId = 1;
  const carbonCredits = 100;

  before(async function () {
    MasterContract = await ethers.getContractFactory("MasterContract");
    BridgeContract = await ethers.getContractFactory("BridgeContract");
    [deployer, issuer, verifier, other] = await ethers.getSigners();
  });

  beforeEach(async function () {
    masterContract = await MasterContract.deploy();
    await masterContract.deployed();

    const tx = await masterContract.deployBridgeContract(issuer.address, verifier.address, tokenId, carbonCredits);
    const receipt = await tx.wait();
    const event = receipt.events.find((event) => event.event === "BridgeContractDeployed");
    bridgeContract = await BridgeContract.attach(event.args.bridgeContractAddress);
  });

  describe("Deployment", function () {
    it("Should set the correct owner address", async function () {
      const owner = await bridgeContract.owner();
      expect(owner).to.equal(masterContract.address);
    });

    it("Should set the correct issuer and verifier addresses", async function () {
      const storedIssuer = await bridgeContract.issuer();
      const storedVerifier = await bridgeContract.verifier();
      expect(storedIssuer).to.equal(issuer.address);
      expect(storedVerifier).to.equal(verifier.address);
    });
  });

  describe("registerCarbonCredits", function () {
    it("Should register carbon credits", async function () {
      const ipfsCID = "QmXk8jjhWVjgQMsxUx7hJv6Gm2TbAMmbQfY1YbKPWjHP9p";

      await expect(bridgeContract.connect(issuer).registerCarbonCredits(tokenId, carbonCredits, ipfsCID))
        .to.emit(bridgeContract, "CarbonCreditsRegistered")
        .withArgs(tokenId, carbonCredits, ipfsCID);
    });
  });

  describe("signCarbonCredits", function () {
    it("Should sign carbon credits", async function () {
      const ipfsCID = "QmXk8jjhWVjgQMsxUx7hJv6Gm2TbAMmbQfY1YbKPWjHP9p";

      await bridgeContract.connect(issuer).registerCarbonCredits(tokenId, carbonCredits, ipfsCID);
      await expect(bridgeContract.connect(verifier).signCarbonCredits(tokenId, ipfsCID))
        .to.emit(bridgeContract, "CarbonCreditsSigned")
        .withArgs(tokenId, verifier.address);
    });
  });

  describe("getCarbonCreditsData", function () {
    it("Should return carbon credits data", async function () {
      const ipfsCID = "QmXk8jjhWVjgQMsxUx7hJv6Gm2TbAMmbQfY1YbKPWjHP9p";

      await bridgeContract.connect(issuer).registerCarbonCredits(tokenId, carbonCredits, ipfsCID);
      await bridgeContract.connect(verifier).signCarbonCredits(tokenId, ipfsCID);

      const data = await bridgeContract.getCarbonCreditsData(tokenId);
      expect(data.amount).to.equal(carbonCredits);
      expect(data.verified).to.equal(true);
      expect(data.metadataCID).to.equal(ipfsCID);
    });
  });

  // Add more tests as needed
});
