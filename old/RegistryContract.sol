pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CO2Token.sol";

contract RegistryContract {
    struct CarbonCreditData {
        uint256 id;
        uint256 totalSupply;
        string ipfsHash;
        bool verified;
    }

    address public admin;
    address[] public tokens;
    CarbonCreditData[] public carbonCredits;
    mapping(uint256 => CarbonCreditData) public carbonCreditsById;
    uint256 public carbonCreditsCounter = 1;

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerCarbonCredits(
        string memory name,
        string memory symbol,
        uint256 totalSupply,
        string memory ipfsHash
    ) external onlyAdmin returns (uint256) {
        CO2Token token = new CO2Token(name, symbol);
        token.setTotalSupply(totalSupply);
        tokens.push(address(token));

        CarbonCreditData memory data = CarbonCreditData({
            id: carbonCreditsCounter,
            totalSupply: totalSupply,
            ipfsHash: ipfsHash,
            verified: false
        });

        carbonCredits.push(data);
        carbonCreditsById[carbonCreditsCounter] = data;
        carbonCreditsCounter++;

        return carbonCreditsCounter - 1;
    }

    function verifyCarbonCredits(uint256 id) external onlyAdmin {
        require(!carbonCreditsById[id].verified, "Already verified");
        carbonCreditsById[id].verified = true;
    }

    function mintAndOfferCarbonCredits(uint256 id, uint256 amount) external onlyAdmin {
        require(carbonCreditsById[id].verified, "Not verified");
        CO2Token token = CO2Token(tokens[id - 1]);
        token.mint(address(this), amount);
    }
}
