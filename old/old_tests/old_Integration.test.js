const { expect } = require("chai");

describe("Carbon Credit Marketplace Integration Test", function () {
  let MasterContract, BridgeContract, PoolContract, MarketplaceContract, ERC20CO2Token, ERC1155Token, CarbonSwapBridge, masterContract, bridgeContract, poolContract, marketplaceContract, erc20CO2Token, erc1155Token, carbonSwapBridge, owner, addr1, addr2;

  beforeEach(async () => {
    // Deploy Master Contract
    MasterContract = await ethers.getContractFactory("MasterContract");
    masterContract = await MasterContract.deploy();
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Deploy Bridge Contract
    bridgeContract = await masterContract.deployBridgeContract(addr1.address, addr2.address, 1, 1000);

    // Deploy Pool Contract
    poolContract = await masterContract.deployPoolContract(bridgeContract.address, 100, 1);

    // Deploy Marketplace Contract
    marketplaceContract = await masterContract.deployMarketplaceContract();

    // Get instances of ERC20CO2Token and ERC1155Token contracts
    erc20CO2Token = await ethers.getContractAt("ERC20CO2Token", await masterContract.getERC20CO2TokenAddress());
    erc1155Token = await ethers.getContractAt("ERC1155Token", await masterContract.getERC1155TokenAddress());

    // Deploy CarbonSwapBridge Contract
    carbonSwapBridge = await masterContract.deployCarbonSwapBridge();
  });

  it("should have a functional carbon credit marketplace", async function () {
    // Register carbon credits
    await masterContract.registerCarbonCredits(1, 1000, "ipfsCID");

    // Sign carbon credits
    await masterContract.signCarbonCredits(1, "ipfsCID");

    // Buy CO2 tokens
    await masterContract.buyCO2Tokens(1, 100, { value: 10000 });

    // Check token balances
    expect(await erc20CO2Token.balanceOf(owner.address)).to.equal(100);
    expect(await erc1155Token.balanceOf(owner.address, 1)).to.equal(100);

    // Offset CO2 tokens
    await masterContract.offsetCO2Tokens(1, 50);

    // Check token balances after offsetting
    expect(await erc20CO2Token.balanceOf(owner.address)).to.equal(50);
    expect(await erc1155Token.balanceOf(owner.address, 1)).to.equal(50);
  });
});
