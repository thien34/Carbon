pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./RegistryContract.sol";

contract MarketplaceContract {
    address public admin;
    RegistryContract public registry;
    
    mapping(address => uint256) public co2TokensPrices;

    event BuyCarbonCredits(
        address indexed buyer,
        address indexed token,
        uint256 amount,
        uint256 price
    );

    event SellCarbonCredits(
        address indexed seller,
        address indexed token,
        uint256 amount,
        uint256 price
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor(address _registry) {
        admin = msg.sender;
        registry = RegistryContract(_registry);
    }

    function setTokenPrice(address token, uint256 price) external onlyAdmin {
        co2TokensPrices[token] = price;
    }

    function buyCarbonCredits(address token, uint256 amount) external payable {
        uint256 price = co2TokensPrices[token];
        uint256 totalCost = price * amount;

        require(totalCost > 0, "Price not set");
        require(msg.value >= totalCost, "Insufficient funds");

        IERC20(token).transferFrom(address(this), msg.sender, amount);

        emit BuyCarbonCredits(msg.sender, token, amount, price);
    }

    function sellCarbonCredits(address token, uint256 amount, uint256 price) external {
        IERC20(token).transferFrom(msg.sender, address(this), amount);
        co2TokensPrices[token] = price;

        emit SellCarbonCredits(msg.sender, token, amount, price);
    }

    function executeTrade(address token, uint256 amount) external payable {
        uint256 price = co2TokensPrices[token];
        uint256 totalCost = price * amount;

        require(totalCost > 0, "Price not set");
        require(msg.value >= totalCost, "Insufficient funds");

        IERC20(token).transfer(msg.sender, amount);

        emit BuyCarbonCredits(msg.sender, token, amount, price);
    }

}
