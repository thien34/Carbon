const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("MarketplaceContract", function () {
    let MasterContract, BridgeContract, PoolContract, MarketplaceContract, ERC20CO2Token, ERC1155Token, masterContract, bridgeContract, poolContract, marketplaceContract, erc20Token, erc1155Token, deployer, issuer, verifier, buyer, seller;
    const tokenId = 1;
    const carbonCredits = 100;
    const initialPrice = ethers.utils.parseEther("1");
    const ipfsCID = "QmTDMoVqvyBkNMRhzvukTDznntByUNDwyNdSfV8dZ3VKRC";

    before(async function () {
        MasterContract = await ethers.getContractFactory("MasterContract");
        BridgeContract = await ethers.getContractFactory("BridgeContract");
        PoolContract = await ethers.getContractFactory("PoolContract");
        MarketplaceContract = await ethers.getContractFactory("MarketplaceContract");
        ERC20CO2Token = await ethers.getContractFactory("ERC20CO2Token");
        ERC1155Token = await ethers.getContractFactory("ERC1155Token");
        [deployer, issuer, verifier, buyer, seller] = await ethers.getSigners();
    });

    beforeEach(async function () {
        masterContract = await MasterContract.deploy();
        await masterContract.deployed();

        const bridgeTx = await masterContract.deployBridgeContract(issuer.address, verifier.address, tokenId, carbonCredits);
        const bridgeReceipt = await bridgeTx.wait();
        const bridgeEvent = bridgeReceipt.events.find((event) => event.event === "BridgeContractDeployed");
        bridgeContract = await BridgeContract.attach(bridgeEvent.args.bridgeContractAddress);

        const poolTx = await masterContract.deployPoolContract(bridgeContract.address, initialPrice, tokenId);
        const poolReceipt = await poolTx.wait();
        const poolEvent = poolReceipt.events.find((event) => event.event === "PoolContractDeployed");
        poolContract = await PoolContract.attach(poolEvent.args.poolContractAddress);

        const erc20Address = await poolContract.erc20Token();
        erc20Token = await ERC20CO2Token.attach(erc20Address);

        const marketplaceTx = await masterContract.deployMarketplaceContract(poolContract.address);
        const marketplaceReceipt = await marketplaceTx.wait();
        const marketplaceEvent = marketplaceReceipt.events.find((event) => event.event === "MarketplaceContractDeployed");
        marketplaceContract = await MarketplaceContract.attach(marketplaceEvent.args.marketplaceContractAddress);

        const erc1155Address = await marketplaceContract.erc1155Token();
        erc1155Token = await ERC1155Token.attach(erc1155Address);
    });

    describe("Deployment", function () {
        it("Should set the correct owner address", async function () {
            const owner = await marketplaceContract.owner();
            expect(owner).to.equal(masterContract.address);
        });

        it("Should set the correct Pool Contract address", async function () {
            const storedPoolContract = await marketplaceContract.poolContract();
            expect(storedPoolContract).to.equal(poolContract.address);
        });
    });

    describe("buyCO2Tokens", function () {
        it("Should buy CO2 tokens and create an NFT", async function () {
            // Pre-conditions: The bridge contract must have registered and signed the carbon credits
            await bridgeContract.connect(issuer).registerCarbonCredits(tokenId, carbonCredits, ipfsCID);
            await bridgeContract.connect(verifier).signCarbonCredits(tokenId, ipfsCID);

            // The buyer should have enough TRON to buy the CO2 tokens
            await buyer.sendTransaction({ to: marketplaceContract.address, value: initialPrice });
            // The buyer calls the buyCO2Tokens function
            await marketplaceContract.connect(buyer).buyCO2Tokens(tokenId, 1);

            // Check that the buyer received the ERC20 CO2 tokens
            const buyerCO2TokenBalance = await erc20Token.balanceOf(buyer.address);
            expect(buyerCO2TokenBalance).to.equal(1);

            // Check that the buyer received the ERC1155 NFT
            const buyerNFTBalance = await erc1155Token.balanceOf(buyer.address, tokenId);
            expect(buyerNFTBalance).to.equal(1);
        });
    });

    describe("sellCO2Tokens", function () {
        beforeEach(async function () {
            // Pre-conditions: The bridge contract must have registered and signed the carbon credits
            await bridgeContract.connect(issuer).registerCarbonCredits(tokenId, carbonCredits, ipfsCID);
            await bridgeContract.connect(verifier).signCarbonCredits(tokenId, ipfsCID);

            // The buyer should have enough TRON to buy the CO2 tokens
            await buyer.sendTransaction({ to: marketplaceContract.address, value: initialPrice });

            // The buyer buys CO2 tokens and receives an NFT
            await marketplaceContract.connect(buyer).buyCO2Tokens(tokenId, 1);
        });

        it("Should create a sell order for CO2 tokens", async function () {
            // The seller approves the Marketplace contract to handle the CO2 tokens
            await erc20Token.connect(buyer).approve(marketplaceContract.address, 1);

            // The seller calls the sellCO2Tokens function
            await marketplaceContract.connect(buyer).sellCO2Tokens(tokenId, 1, initialPrice);

            // Check that the sell order was created
            const sellOrder = await marketplaceContract.getSellOrder(tokenId, buyer.address);
            expect(sellOrder.amount).to.equal(1);
            expect(sellOrder.price).to.equal(initialPrice);
        });
    });

    describe("executeTrade", function () {
        beforeEach(async function () {
            // Pre-conditions: The bridge contract must have registered and signed the carbon credits
            await bridgeContract.connect(issuer).registerCarbonCredits(tokenId, carbonCredits, ipfsCID);
            await bridgeContract.connect(verifier).signCarbonCredits(tokenId, ipfsCID);
            // The buyer should have enough TRON to buy the CO2 tokens
            await buyer.sendTransaction({ to: marketplaceContract.address, value: initialPrice });

            // The buyer buys CO2 tokens and receives an NFT
            await marketplaceContract.connect(buyer).buyCO2Tokens(tokenId, 1);

            // The seller approves the Marketplace contract to handle the CO2 tokens
            await erc20Token.connect(buyer).approve(marketplaceContract.address, 1);

            // The seller creates a sell order for CO2 tokens
            await marketplaceContract.connect(buyer).sellCO2Tokens(tokenId, 1, initialPrice);
        });

        it("Should execute a trade between buyer and seller", async function () {
            // The new buyer sends enough TRON to cover the trade
            await seller.sendTransaction({ to: marketplaceContract.address, value: initialPrice });

            // The new buyer calls the executeTrade function
            await marketplaceContract.connect(seller).executeTrade(tokenId, buyer.address, seller.address, 1);

            // Check that the trade was executed
            const newBuyerCO2TokenBalance = await erc20Token.balanceOf(seller.address);
            expect(newBuyerCO2TokenBalance).to.equal(1);

            const newBuyerNFTBalance = await erc1155Token.balanceOf(seller.address, tokenId);
            expect(newBuyerNFTBalance).to.equal(1);

            // Check that the original seller's balances were updated
            const originalSellerCO2TokenBalance = await erc20Token.balanceOf(buyer.address);
            expect(originalSellerCO2TokenBalance).to.equal(0);

            const originalSellerNFTBalance = await erc1155Token.balanceOf(buyer.address, tokenId);
            expect(originalSellerNFTBalance).to.equal(0);

            // Check that the sell order was removed
            const sellOrder = await marketplaceContract.getSellOrder(tokenId, buyer.address);
            expect(sellOrder.amount).to.equal(0);
            expect(sellOrder.price).to.equal(0);
        });
    });
});
