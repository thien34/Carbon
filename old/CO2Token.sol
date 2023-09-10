pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CO2Token is ERC20 {
    address public admin;
    uint256 private _totalSupply;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        admin = msg.sender;
    }

    function setTotalSupply(uint256 totalSupply) external onlyAdmin {
        _totalSupply = totalSupply;
    }

    function totalSupply() public view override returns (uint256) {
        return _totalSupply;
    }

    function mint(address to, uint256 amount) external onlyAdmin {
        _mint(to, amount);
        _totalSupply -= amount;
    }

    function burn(address from, uint256 amount) external onlyAdmin {
        _burn(from, amount);
        _totalSupply += amount;
    }
}
