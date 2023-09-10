// test/CarbonSwapBridge.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonSwapBridge", function () {
    let MasterContract, masterContract;
    let BridgeContract, bridgeContract;
    let PoolContract, poolContract;
    let ERC20CO2Token, erc20Token;
    let ERC1155Token, erc1155Token;
    let CarbonSwapBridge, carbonSwapBridge;

    let deployer, issuer, verifier, buyer, seller, other;
    let tokenId;

    beforeEach(async function () {
        [deployer, issuer, verifier, buyer, seller, other] = await ethers.getSigners();

        // Deploy the required contracts
        MasterContract = await ethers.getContractFactory("MasterContract");
        masterContract = await MasterContract.deploy();

        BridgeContract = await ethers.getContractFactory("BridgeContract");
        bridgeContract = await BridgeContract.deploy(masterContract.address);

        PoolContract = await ethers.getContractFactory("PoolContract");
        poolContract = await PoolContract.deploy(masterContract.address, bridgeContract.address);

        ERC20CO2Token = await ethers.getContractFactory("ERC20CO2Token");
        erc20Token = await ERC20CO2Token.deploy(poolContract.address);

        ERC1155Token = await ethers.getContractFactory("ERC1155Token");
        erc1155Token = await ERC1155Token.deploy(masterContract.address);

        CarbonSwapBridge = await ethers.getContractFactory("CarbonSwapBridge");
        carbonSwapBridge = await CarbonSwapBridge.deploy(masterContract.address, poolContract.address);

        // Set up the test data
        tokenId = 1;
        await bridgeContract.connect(issuer).registerCarbonCredits(tokenId, 100, "ipfsCID");
        await bridgeContract.connect(verifier).signCarbonCredits(tokenId, "ipfsCID");

        // Add the supported tokens
        const bctAddress = "0x123...";
        const mossAddress = "0x456...";
        const bctChainId = 1;
        const mossChainId = 2;
        await carbonSwapBridge.connect(deployer).addSupportedToken(bctAddress, bctChainId);
        await carbonSwapBridge.connect(deployer).addSupportedToken(mossAddress, mossChainId);
    });

    describe("lockTokens", function () {
        it("should lock the supported tokens", async function () {
            const tokenAddress = "0x123...";
            const lockAmount = 10;
            await carbonSwapBridge.connect(buyer).lockTokens(buyer.address, tokenAddress, lockAmount);

            const lockedTokens = await carbonSwapBridge.getLockedTokens(buyer.address, tokenAddress);
            expect(lockedTokens).to.equal(lockAmount);
        });
    });

    describe("unlockTokens", function () {
        it("should unlock the supported tokens", async function () {
            const tokenAddress = "0x123...";
            const lockAmount = 10;
            const unlockAmount = 5;
            await carbonSwapBridge.connect(buyer).lockTokens(buyer.address, tokenAddress, lockAmount);
            await carbonSwapBridge.connect(buyer).unlockTokens(buyer.address, tokenAddress, unlockAmount);

            const lockedTokens = await carbonSwapBridge.getLockedTokens(buyer.address, tokenAddress);
            expect(lockedTokens).to.equal(lockAmount - unlockAmount);
        });
    });

    describe("swapToCO2Tokens", function () {
        it("should swap the supported tokens to CO2 tokens", async function () {
            const tokenAddress = "0x123...";
            const lockAmount = 10;
            await carbonSwapBridge.connect(buyer).lockTokens(buyer.address, tokenAddress, lockAmount);
            await carbonSwapBridge.connect(buyer).swapToCO2Tokens(buyer.address, tokenAddress, lockAmount);
            const co2Tokens = await erc20Token.balanceOf(buyer.address);
            expect(co2Tokens).to.equal(lockAmount);

            const lockedTokens = await carbonSwapBridge.getLockedTokens(buyer.address, tokenAddress);
            expect(lockedTokens).to.equal(0);
        });
    });

    describe("swapFromCO2Tokens", function () {
        it("should swap the CO2 tokens back to the supported tokens", async function () {
            const tokenAddress = "0x123...";
            const lockAmount = 10;
            const swapAmount = 5;
            await carbonSwapBridge.connect(buyer).lockTokens(buyer.address, tokenAddress, lockAmount);
            await carbonSwapBridge.connect(buyer).swapToCO2Tokens(buyer.address, tokenAddress, lockAmount);
            await carbonSwapBridge.connect(buyer).swapFromCO2Tokens(buyer.address, tokenAddress, swapAmount);


            const co2Tokens = await erc20Token.balanceOf(buyer.address);
            expect(co2Tokens).to.equal(lockAmount - swapAmount);

            const lockedTokens = await carbonSwapBridge.getLockedTokens(buyer.address, tokenAddress);
            expect(lockedTokens).to.equal(swapAmount);
        });

    });
});