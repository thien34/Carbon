// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BridgeContract.sol";
import "./PoolContract.sol";
import "./ERC20CO2Token.sol";
import "./ERC1155Token.sol";
import "./MarketplaceContract.sol";

/**
 * @title MasterContract
 * @dev The MasterContract is responsible for managing and deploying other contracts
 * in the Carbon Credits Ecosystem. It can deploy BridgeContract, PoolContract, ERC20CO2Token,
 * ERC1155Token, and MarketplaceContract.
 */
contract MasterContract {
    address public owner;

    // Events to track contract deployments
    event BridgeContractDeployed(address contractAddress);
    event PoolContractDeployed(address contractAddress);
    event ERC20TokenDeployed(address contractAddress);
    event ERC1155TokenDeployed(address contractAddress);
    event MarketplaceContractDeployed(address contractAddress);

    constructor() {
        owner = msg.sender;
    }

    /**
     * @dev Deploys a new BridgeContract
     * @param issuer The issuer address
     * @param verifier The verifier address
     * @param tokenId The tokenId associated with this BridgeContract
     * @param carbonCredits The initial amount of carbon credits
     * @return The address of the newly deployed BridgeContract
     */
    function deployBridgeContract(
        address issuer,
        address verifier,
        uint256 tokenId,
        uint256 carbonCredits
    ) public returns (address) {
        require(
            msg.sender == owner,
            "Only the owner can deploy Bridge Contracts"
        );
        BridgeContract bridge = new BridgeContract(
            issuer,
            verifier,
            tokenId,
            carbonCredits
        );
        emit BridgeContractDeployed(address(bridge));
        return address(bridge);
    }

    /**
     * @dev Deploys a new PoolContract
     * @param bridgeAddress The address of the associated BridgeContract
     * @param initialPrice The initial price of CO2 tokens in the pool
     * @param tokenId The tokenId associated with this PoolContract
     * @return The address of the newly deployed PoolContract
     */
    function deployPoolContract(
        address bridgeAddress,
        uint256 initialPrice,
        uint256 tokenId
    ) public returns (address) {
        require(
            msg.sender == owner,
            "Only the owner can deploy Pool Contracts"
        );
        PoolContract pool = new PoolContract(
            bridgeAddress,
            initialPrice,
            tokenId
        );
        emit PoolContractDeployed(address(pool));
        return address(pool);
    }

    /**
     * @dev Deploys a new ERC20CO2Token
     * @param name The name of the CO2 token
     * @param symbol The symbol of the CO2 token
     * @return The address of the newly deployed ERC20CO2Token
     */
    function deployERC20Token(
        string memory name,
        string memory symbol
    ) public returns (address) {
        require(
            msg.sender == owner,
            "Only the owner can deploy ERC20 CO2 Tokens"
        );
        ERC20CO2Token erc20Token = new ERC20CO2Token(name, symbol);
        emit ERC20TokenDeployed(address(erc20Token));
        return address(erc20Token);
    }

    /**
     * @dev Deploys a new ERC1155Token Contract
     * @param marketplaceContractAddress The address of the associated MarketplaceContract
     * @return The address of the newly deployed ERC1155Token Contract
     */
    function deployERC1155TokenContract(
        address marketplaceContractAddress
    ) public returns (address) {
        require(
            msg.sender == owner,
            "Only the owner can deploy ERC1155Token Contracts"
        );
        ERC1155Token erc1155Token = new ERC1155Token(
            marketplaceContractAddress
        );
        emit ERC1155TokenContractDeployed(address(erc1155Token));
        return address(erc1155Token);
    }

    /**
     * @dev Deploys a new MarketplaceContract
     * @param poolContractAddress The address of the associated PoolContract
     * @param erc20TokenAddress The address of the associated ERC20CO2Token
     * @param erc1155TokenAddress The address of the associated ERC1155Token
     * @return The address of the newly deployed MarketplaceContract
     */
    function deployMarketplaceContract(
        address poolContractAddress,
        address erc20TokenAddress,
        address erc1155TokenAddress
    ) public returns (address) {
        require(
            msg.sender == owner,
            "Only the owner can deploy Marketplace Contracts"
        );
        MarketplaceContract marketplace = new MarketplaceContract(
            poolContractAddress,
            erc20TokenAddress,
            erc1155TokenAddress
        );
        emit MarketplaceContractDeployed(address(marketplace));
        return address(marketplace);
    }
}
