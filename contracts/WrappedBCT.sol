// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WrappedBCT is ERC20, Ownable {
    IERC20 public wrappedToken;
    uint256 public tokenId;

    constructor(address _wrappedToken, uint256 _tokenId)
        ERC20("WrappedBCT", "WBCT")
    {
        wrappedToken = IERC20(_wrappedToken);
        tokenId = _tokenId;
    }

    function wrap(address user, uint256 amount) external {
        require(
            wrappedToken.transferFrom(user, address(this), amount),
            "WrappedBCT: Transfer failed"
        );
        _mint(user, amount);
    }

    function unwrap(address user, uint256 amount) external {
        _burn(user, amount);
        require(
            wrappedToken.transfer(user, amount),
            "WrappedBCT: Transfer failed"
        );
    }

    function getTokenId() external view returns (uint256) {
        return tokenId;
    }
}
