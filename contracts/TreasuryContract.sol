// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappedBCT.sol";
import "./ERC1155Token.sol";
import "./BridgeContract.sol";

contract Treasury is Ownable {
    ERC1155Token public erc1155Token;
    WrappedBCT public wrappedBCT;
    IERC20 public bct;
    Bridge public bridge;
    mapping(address => bool) public whitelisted;

    constructor(address _bridge, address _wrappedBCT, address _bct) {
        bridge = Bridge(_bridge);
        wrappedBCT = WrappedBCT(_wrappedBCT);
        bct = IERC20(_bct);
        erc1155Token = ERC1155Token(bridge.erc1155Token());
    }

    function addToWhitelist(address account) public onlyOwner {
        whitelisted[account] = true;
    }

    function removeFromWhitelist(address account) public onlyOwner {
        whitelisted[account] = false;
    }

    function wrap(uint256 amount) public {
        require(whitelisted[msg.sender], "Not whitelisted");
        wrappedBCT.wrap(msg.sender, amount);
        uint256 tokenId = wrappedBCT.getTokenId();
        erc1155Token.mint(msg.sender, tokenId, amount, "");
    }

    function bridgeTokens(uint256 amount) public {
        require(whitelisted[msg.sender], "Not whitelisted");
        wrappedBCT.unwrap(msg.sender, amount);
        uint256 tokenId = wrappedBCT.getTokenId();
        erc1155Token.burn(msg.sender, tokenId, amount);
    }
}
