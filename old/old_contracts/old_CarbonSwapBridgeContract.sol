// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PoolContract.sol";

contract CarbonSwapBridge {
    address public owner;
    PoolContract public poolContract;

    mapping(address => uint256) public supportedTokenChainId;

    event TokenLocked(address indexed user, address indexed token, uint256 amount);
    event TokenUnlocked(address indexed user, address indexed token, uint256 amount);
    event SwappedToCO2Tokens(address indexed user, address indexed token, uint256 amount);
    event SwappedFromCO2Tokens(address indexed user, address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    constructor(address _poolContractAddress) {
        owner = msg.sender;
        poolContract = PoolContract(_poolContractAddress);
    }

    function addSupportedToken(address tokenAddress, uint256 chainId) external onlyOwner {
        supportedTokenChainId[tokenAddress] = chainId;
    }

    function removeSupportedToken(address tokenAddress) external onlyOwner {
        delete supportedTokenChainId[tokenAddress];
    }

    function lockTokens(address tokenAddress, uint256 amount) external {
        require(supportedTokenChainId[tokenAddress] != 0, "Token not supported");

        IERC20(tokenAddress).transferFrom(msg.sender, address(this), amount);
        emit TokenLocked(msg.sender, tokenAddress, amount);
    }

    function unlockTokens(address tokenAddress, uint256 amount) external {
        require(supportedTokenChainId[tokenAddress] != 0, "Token not supported");

        IERC20(tokenAddress).transfer(msg.sender, amount);
        emit TokenUnlocked(msg.sender, tokenAddress, amount);
    }

    function swapToCO2Tokens(uint256 tokenId, address tokenAddress, uint256 amount) external {
        lockTokens(tokenAddress, amount);

        poolContract.mintCO2Tokens(msg.sender, tokenId, amount);
        emit SwappedToCO2Tokens(msg.sender, tokenAddress, amount);
    }

    function swapFromCO2Tokens(uint256 tokenId, address tokenAddress, uint256 amount) external {
        poolContract.burnCO2Tokens(tokenId, amount);

        unlockTokens(tokenAddress, amount);
        emit SwappedFromCO2Tokens(msg.sender, tokenAddress, amount);
    }
}