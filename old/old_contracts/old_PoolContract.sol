// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract PoolContract {
    address public owner;
    address public bridgeContractAddress;
    IERC20 public co2Token;
    uint256 public initialPrice;

    mapping(uint256 => uint256) public tokenPrice;

    event CO2TokensMinted(uint256 tokenId, address buyer, uint256 amount);
    event CO2TokensBurned(uint256 tokenId, uint256 amount);
    event TokenPriceUpdated(uint256 tokenId, uint256 newPrice);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier onlyBridgeContract() {
        require(msg.sender == bridgeContractAddress, "Caller is not the Bridge Contract");
        _;
    }

    constructor(address _bridgeContractAddress, address _co2TokenAddress, uint256 _initialPrice) {
        owner = msg.sender;
        bridgeContractAddress = _bridgeContractAddress;
        co2Token = IERC20(_co2TokenAddress);
        initialPrice = _initialPrice;
    }

    function mintCO2Tokens(address buyer, uint256 tokenId, uint256 amount) external onlyBridgeContract {
        uint256 price = tokenPrice[tokenId] == 0 ? initialPrice : tokenPrice[tokenId];
        uint256 cost = amount * price;

        require(co2Token.transferFrom(buyer, address(this), cost), "Transfer failed");

        co2Token.transfer(buyer, amount);
        emit CO2TokensMinted(tokenId, buyer, amount);
    }

    function burnCO2Tokens(uint256 tokenId, uint256 amount) external onlyBridgeContract {
        co2Token.burn(amount);
        emit CO2TokensBurned(tokenId, amount);
    }

    function setTokenPrice(uint256 tokenId, uint256 newPrice) external onlyOwner {
        tokenPrice[tokenId] = newPrice;
        emit TokenPriceUpdated(tokenId, newPrice);
    }
}