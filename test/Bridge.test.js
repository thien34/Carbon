const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Bridge", function () {
    let Bridge, bridge, WrappedBCT, wrappedBCT, MockBCT, mockBCT, owner, addr1, addr2;

    beforeEach(async function () {
        // Deploy MockBCT
        MockBCT = await ethers.getContractFactory("MockERC20");
        [owner, addr1, addr2, _] = await ethers.getSigners();
        mockBCT = await MockBCT.deploy("Mock BCT", "MBCT", 1000000);

        // Deploy WrappedBCT
        WrappedBCT = await ethers.getContractFactory("WrappedBCT");
        wrappedBCT = await WrappedBCT.deploy(mockBCT.address, 1);

        // Deploy ERC1155Token
        ERC1155Token = await ethers.getContractFactory("ERC1155Token");
        erc1155Token = await ERC1155Token.deploy("https://token-uri.com/{id}.json");

        // Deploy Bridge
        Bridge = await ethers.getContractFactory("Bridge");
        bridge = await Bridge.deploy(wrappedBCT.address, mockBCT.address, "https://token-uri.example/"); // Change this line

        // Add WrappedBCT as a supported wrapper in Bridge
        await bridge.addSupportedWrapper(wrappedBCT.address);
    });

    describe("Deposit", function () {
        it("Should deposit WrappedBCT tokens correctly", async function () {


            // Transfer some MockBCT tokens to addr1
            await mockBCT.transfer(addr1.address, 1000);

            // Connect to addr1 signer
            const mockBCTWithAddr1 = mockBCT.connect(addr1);

            // Approve the transfer of 500 MockBCT tokens from addr1 to WrappedBCT contract
            await mockBCT.connect(addr1).approve(wrappedBCT.address, 500);

            // Approve bridge to transfer MockBCT tokens on behalf of addr1
            await mockBCTWithAddr1.approve(bridge.address, 500);

            // Deposit 500 MockBCT tokens
            const bridgeWithAddr1 = bridge.connect(addr1);
            await bridgeWithAddr1.wrapTokens(wrappedBCT.address, 500);

            // Check if 500 WrappedBCT tokens are minted for addr1
            expect(await wrappedBCT.balanceOf(addr1.address)).to.equal(500);
        });
    });

    describe("Withdraw", function () {
        it("Should withdraw and convert WrappedBCT tokens to BCT correctly", async function () {

            // Transfer 1000 MockBCT tokens to addr1
            await mockBCT.transfer(addr1.address, 1000);

            // Approve the transfer of 1000 MockBCT tokens from addr1 to WrappedBCT contract
            await mockBCT.connect(addr1).approve(wrappedBCT.address, 1000);


            const bridgeWithAddr1 = bridge.connect(addr1);

            // Deposit 500 MockBCT tokens
            await bridgeWithAddr1.wrapTokens(wrappedBCT.address, 500);

            // Check if 500 ERC1155 tokens are minted for addr1
            const tokenId = await wrappedBCT.getTokenId();
            expect(await wrappedBCT.balanceOf(addr1.address)).to.equal(500);


            // Connect to WrappedBCT with addr1 signer
            const wrappedBCTWithAddr1 = wrappedBCT.connect(addr1);

            // Approve bridge to transfer WrappedBCT tokens on behalf of addr1
            await wrappedBCTWithAddr1.approve(bridge.address, 1000);

            // Unwrap 500 WrappedBCT tokens and convert to BCT
            await bridgeWithAddr1.unwrapTokens(wrappedBCT.address, 500); // Change this line

            // Check if 500 BCT tokens are transferred back to addr1
            expect(await mockBCT.balanceOf(addr1.address)).to.equal(1000);
        });
    });
});
