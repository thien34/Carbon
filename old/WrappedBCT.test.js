const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("WrappedBCT", function () {
    let WrappedBCT, wrappedBCT, CarbonCreditERC1155, carbonCreditERC1155, owner, addr1, addr2, bctToken;

    beforeEach(async function () {
        // Deploy CarbonCreditERC1155 contract
        CarbonCreditERC1155 = await ethers.getContractFactory("CarbonCreditERC1155");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        carbonCreditERC1155 = await CarbonCreditERC1155.deploy("https://example.com/metadata/");

        // Deploy WrappedBCT contract
        WrappedBCT = await ethers.getContractFactory("WrappedBCT");
        wrappedBCT = await WrappedBCT.deploy(carbonCreditERC1155.address);

        // Simulate BCT Token contract
        bctToken = await ethers.getContractFactory("BCTToken");
        bctToken = await bctToken.deploy("Toucan BCT Token", "BCT", 18);
    });

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            expect(await wrappedBCT.owner()).to.equal(owner.address);
        });

        it("Should set the correct carbonCreditERC1155 address", async function () {
            expect(await wrappedBCT.carbonCreditERC1155()).to.equal(carbonCreditERC1155.address);
        });
    });

    describe("Token wrapping", function () {
        beforeEach(async function () {
            // Mint BCT tokens to addr1
            await bctToken.connect(owner).mint(addr1.address, ethers.utils.parseEther("100"));
            // Approve WrappedBCT contract to spend addr1's BCT tokens
            await bctToken.connect(addr1).approve(wrappedBCT.address, ethers.utils.parseEther("100"));
        });

        it("Should wrap BCT tokens successfully", async function () {
            await wrappedBCT.connect(addr1).wrapBCTTokens(ethers.utils.parseEther("50"));
            expect(await carbonCreditERC1155.balanceOf(addr1.address, 0)).to.equal(50);
            expect(await bctToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("50"));
        });

        it("Should fail wrapping BCT tokens without sufficient allowance", async function () {
            await bctToken.connect(addr1).approve(wrappedBCT.address, ethers.utils.parseEther("10"));
            await expect(wrappedBCT.connect(addr1).wrapBCTTokens(ethers.utils.parseEther("50"))).to.be.revertedWith(
                "WrappedBCT: Not enough BCT tokens allowed for wrapping"
            );
        });
    });

    describe("Token unwrapping", function () {
        beforeEach(async function () {
            // Mint BCT tokens to addr1
            await bctToken.connect(owner).mint(addr1.address, ethers.utils.parseEther("100"));
            // Approve WrappedBCT contract to spend addr1's BCT tokens
            await bctToken.connect(addr1).approve(wrappedBCT.address, ethers.utils.parseEther("100"));
            // Wrap 100 BCT tokens
            await wrappedBCT.connect(addr1).wrapBCTTokens(ethers.utils.parseEther("100"));
        });

        it("Should unwrap BCT tokens successfully", async function () {
            await wrappedBCT.connect(addr1).unwrapBCTTokens(ethers.utils.parseEther("50"));
            expect(await carbonCreditERC1155.balanceOf(addr1.address, 0)).to.equal(50);
            expect(await bctToken.balanceOf(addr1.address)).to.equal(ethers.utils.parseEther("150"));
        });
        it("Should fail unwrapping BCT tokens without sufficient balance", async function () {
            await expect(wrappedBCT.connect(addr1).unwrapBCTTokens(ethers.utils.parseEther("150"))).to.be.revertedWith(
                "CarbonCreditERC1155: insufficient balance for transfer"
            );
        });
    });

    describe("Token wrapping and unwrapping by owner", function () {
        beforeEach(async function () {
            // Mint BCT tokens to owner
            await bctToken.connect(owner).mint(owner.address, ethers.utils.parseEther("100"));
            // Approve WrappedBCT contract to spend owner's BCT tokens
            await bctToken.connect(owner).approve(wrappedBCT.address, ethers.utils.parseEther("100"));
            // Wrap 100 BCT tokens
            await wrappedBCT.connect(owner).wrapBCTTokens(ethers.utils.parseEther("100"));
        }); it("Should wrap and unwrap BCT tokens successfully by the owner", async function () {
            await wrappedBCT.connect(owner).unwrapBCTTokens(ethers.utils.parseEther("50"));
            expect(await carbonCreditERC1155.balanceOf(owner.address, 0)).to.equal(50);
            expect(await bctToken.balanceOf(owner.address)).to.equal(ethers.utils.parseEther("150"));
        });
    });
});            
