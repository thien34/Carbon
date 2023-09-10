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


// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/IERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

contract Marketplace is ERC1155Receiver {
    IERC1155 public erc1155Token;
    IERC20 public trxToken;
    IERC20 public usdtToken;

    uint256 private _nextListingId = 1;

    struct Listing {
        address seller;
        uint256 tokenId;
        uint256 amount;
        uint256 pricePerToken;
        bool isTRX;
    }

    mapping(uint256 => Listing) public listings;

    event NewListing(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 amount,
        uint256 pricePerToken,
        bool isTRX
    );
    event ListingPurchased(
        uint256 indexed listingId,
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 amount
    );

    constructor(address _erc1155Token, address _trxToken, address _usdtToken) {
        erc1155Token = IERC1155(_erc1155Token);
        trxToken = IERC20(_trxToken);
        usdtToken = IERC20(_usdtToken);
    }

    function createListing(
        uint256 tokenId,
        uint256 amount,
        uint256 pricePerToken,
        bool isTRX
    ) external {
        require(amount > 0, "Marketplace: Amount must be greater than 0");
        require(
            pricePerToken > 0,
            "Marketplace: Price per token must be greater than 0"
        );

        erc1155Token.safeTransferFrom(
            msg.sender,
            address(this),
            tokenId,
            amount,
            ""
        );

        Listing memory newListing = Listing({
            seller: msg.sender,
            tokenId: tokenId,
            amount: amount,
            pricePerToken: pricePerToken,
            isTRX: isTRX
        });

        listings[_nextListingId] = newListing;

        emit NewListing(
            _nextListingId,
            msg.sender,
            tokenId,
            amount,
            pricePerToken,
            isTRX
        );

        _nextListingId++;
    }

    function buyListing(uint256 listingId, uint256 amount) external {
        Listing storage listing = listings[listingId];

        require(
            listing.amount >= amount,
            "Marketplace: Not enough tokens available"
        );
        require(amount > 0, "Marketplace: Amount must be greater than 0");

        uint256 totalPrice = listing.pricePerToken * amount;

        if (listing.isTRX) {
            require(
                trxToken.transferFrom(msg.sender, listing.seller, totalPrice),
                "Marketplace: TRX transfer failed"
            );
        } else {
            require(
                usdtToken.transferFrom(msg.sender, listing.seller, totalPrice),
                "Marketplace: USDT transfer failed"
            );
        }

        erc1155Token.safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            amount,
            ""
        );

        listing.amount -= amount;

        if (listing.amount == 0) {
            delete listings[listingId];
        }

        emit ListingPurchased(listingId, msg.sender, listing.tokenId, amount);
    }

    function cancelListing(uint256 listingId) external {
        Listing storage listing = listings[listingId];

        require(
            listing.seller == msg.sender,
            "Marketplace: Only the seller can cancel the listing"
        );

        erc1155Token.safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId,
            listing.amount,
            ""
        );

        delete listings[listingId];

        emit ListingCancelled(
            listingId,
            msg.sender,
            listing.tokenId,
            listing.amount
        );
    }

    function getNextListingId() external view returns (uint256) {
        return _nextListingId;
    }

    function getListing(
        uint256 listingId
    ) external view returns (Listing memory) {
        return listings[listingId];
    }

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        uint256 indexed tokenId,
        uint256 amount
    );

    function onERC1155Received(
        address /* operator */,
        address /* from */,
        uint256 /* id */,
        uint256 /* value */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address /* operator */,
        address /* from */,
        uint256[] calldata /* ids */,
        uint256[] calldata /* values */,
        bytes calldata /* data */
    ) external pure override returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }
}

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

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }
}
