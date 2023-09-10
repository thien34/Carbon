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
