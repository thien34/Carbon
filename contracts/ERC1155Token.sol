// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ERC1155Token is ERC1155, Ownable {
    uint256 private _currentTokenID = 1;

    constructor(string memory uri) ERC1155(uri) {}

    function mint(
        address to,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) external {
        require(msg.sender == owner() || msg.sender == address(this), "ERC1155Token: Only owner or the contract itself can mint tokens");
        _mint(to, id, amount, data);
    }

    function mintFungibleToken(
        address to,
        uint256 amount,
        bytes memory data
    ) external onlyOwner {
        _mint(to, _currentTokenID, amount, data);
        _currentTokenID += 1;
    }

    function mintNonFungibleToken(
        address to,
        bytes memory data
    ) external onlyOwner {
        _mint(to, _currentTokenID, 1, data);
        _currentTokenID += 1;
    }

    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) external onlyOwner {
        _burn(account, id, amount);
    }

    function setURI(string memory newuri) external onlyOwner {
        _setURI(newuri);
    }
}
