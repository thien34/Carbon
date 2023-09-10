// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./WrappedBCT.sol";
import "./ERC1155Token.sol";

contract Bridge is Ownable {
    ERC1155Token public erc1155Token;
    WrappedBCT public wrappedBCT;
    IERC20 public bct;
    mapping(address => bool) public supportedWrappers;

    constructor(address _wrappedBCT, address _bct, string memory _uri) {
        wrappedBCT = WrappedBCT(_wrappedBCT);
        bct = IERC20(_bct);
        erc1155Token = new ERC1155Token(_uri);
    }

    function addSupportedWrapper(address wrapperAddress) external onlyOwner {
        supportedWrappers[wrapperAddress] = true;
    }

    function removeSupportedWrapper(address wrapperAddress) external onlyOwner {
        supportedWrappers[wrapperAddress] = false;
    }

    function wrapTokens(address wrapperAddress, uint256 amount) external {
        require(
            supportedWrappers[wrapperAddress],
            "Bridge: Unsupported wrapper"
        );
        WrappedBCT wrapper = WrappedBCT(wrapperAddress);
        wrapper.wrap(msg.sender, amount);
        uint256 tokenId = wrapper.getTokenId();
        erc1155Token.mint(msg.sender, tokenId, amount, "");
    }

    function unwrapTokens(address wrapperAddress, uint256 amount) external {
        require(
            supportedWrappers[wrapperAddress],
            "Bridge: Unsupported wrapper"
        );
        WrappedBCT wrapper = WrappedBCT(wrapperAddress);

        // Unwrap the WrappedBCT tokens
        wrapper.unwrap(msg.sender, amount);

        // Burn the ERC1155 tokens
        erc1155Token.burn(msg.sender, wrapper.getTokenId(), amount);
    }
}
