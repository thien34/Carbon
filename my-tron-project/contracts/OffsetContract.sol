// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BridgeContract.sol";
import "./ERC1155Token.sol";

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Offset is ERC1155, Ownable {
    uint256 private _currentNFTId;

    Bridge private _bridge;
    ERC1155Token private _erc1155Token;

    constructor(address bridgeAddress, address erc1155TokenAddress, string memory uri) ERC1155(uri) {
        _bridge = Bridge(bridgeAddress);
        _erc1155Token = ERC1155Token(erc1155TokenAddress);
    }

    function offsetCarbonCredits(
        address user,
        uint256 tokenId,
        uint256 amount
    ) external {
        require(
            _erc1155Token.balanceOf(user, tokenId) >= amount,
            "Not enough carbon credits"
        );

        // Burn carbon credits
        _erc1155Token.burn(user, tokenId, amount);

        // Mint NFT receipt
        _mint(user, _currentNFTId, 1, "");
        _currentNFTId++;
    }
}
