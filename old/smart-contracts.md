Smart Contracts

Master Contract:

owner: deployer's wallet address
functions:
deployBridgeContract (parameters: issuerAddress, verifierAddress, tokenId, carbonCredits): deploys a new Bridge Contract and returns its address
deployPoolContract (parameters: bridgeContractAddress, initialPrice, tokenId): deploys a new Pool Contract linked to the Bridge Contract and returns its address
Bridge Contract:

owner: Master Contract
functions:
registerCarbonCredits (parameters: tokenId, carbonCredits, ipfsCID): called by issuerAddress, registers off-chain carbon credits
signCarbonCredits (parameters: tokenId, ipfsCID): called by verifierAddress, signs the carbon credits data on IPFS
getCarbonCreditsData (parameters: tokenId): returns carbon credits data, including the amount, verification status, and metadata CID
events:
CarbonCreditsRegistered (tokenId, carbonCredits, ipfsCID)
CarbonCreditsSigned (tokenId, verifierAddress)
Pool Contract:

owner: Master Contract
functions:
mintCO2Tokens (parameters: buyerAddress, tokenId, amount): mints ERC20 CO2 Tokens in exchange for registered carbon credits, called by Marketplace Contract
burnCO2Tokens (parameters: tokenId, amount): burns ERC20 CO2 Tokens when the corresponding ERC1155 token is burned by the user
setTokenPrice (parameters: tokenId, newPrice): called by issuerAddress, sets the price for ERC20 CO2 Tokens
events:
CO2TokensMinted (tokenId, buyerAddress, amount)
CO2TokensBurned (tokenId, amount)
Marketplace Contract:

owner: Master Contract
functions:
buyCO2Tokens (parameters: tokenId, amount): called by the user, handles the transaction of purchasing CO2 tokens, calls Pool Contract to mint tokens and ERC1155 to create the NFT
sellCO2Tokens (parameters: tokenId, amount, price): called by the user, creates a sell order for CO2 Tokens
executeTrade (parameters: tokenId, sellerAddress, buyerAddress, amount): called by the user, executes a trade between buyer and seller
ERC20 CO2 Token Contract:

owner: Pool Contract
standard ERC20 functions (transfer, balanceOf, etc.)
ERC1155 Token Contract:

owner: Marketplace Contract
standard ERC1155 functions (safeTransferFrom, balanceOf, etc.)
custom functions:
setMetadata (parameters: tokenId, ipfsCID): sets the metadata CID for the token
burnToken (parameters: tokenId, amount): called by the user, burns the token and calls the Pool Contract to burn the corresponding ERC20 CO2 Tokens
For the cross-chain interoperability with BCT tokens from Toucan Protocol and MOSS tokens, you can create a separate Bridge Contract with functions to lock, unlock, and swap these tokens. This Bridge Contract would be deployed by the Master Contract and interact with the Pool Contract to mint and burn corresponding CO2 tokens.

CrossChainBridge Contract:
name: CarbonSwapBridge
owner: Master Contract
functions:
addSupportedToken (parameters: tokenAddress, chainId): called by the owner, adds a supported token and its chain ID for cross-chain swapping
removeSupportedToken (parameters: tokenAddress): called by the owner, removes a supported token from the list
lockTokens (parameters: userAddress, tokenAddress, amount): called by the user, locks the supported token (BCT or MOSS) to be swapped to CO2 tokens
unlockTokens (parameters: userAddress, tokenAddress, amount): called by the user, unlocks the supported token after swapping back from CO2 tokens
swapToCO2Tokens (parameters: userAddress, tokenAddress, amount): called by the user, swaps the locked supported token to CO2 tokens, calls Pool Contract to mint CO2 tokens
swapFromCO2Tokens (parameters: userAddress, tokenAddress, amount): called by the user, swaps the CO2 tokens back to the supported token, calls Pool Contract to burn CO2 tokens
events:
TokenLocked (userAddress, tokenAddress, amount)
TokenUnlocked (userAddress, tokenAddress, amount)
SwappedToCO2Tokens (userAddress, tokenAddress, amount)
SwappedFromCO2Tokens (userAddress, tokenAddress, amount)
This CarbonSwapBridge Contract is designed to handle cross-chain interoperability with BCT tokens from the Toucan Protocol and MOSS tokens. It allows users to lock their supported tokens on their original chains, swap them to CO2 tokens, and then swap back to their original tokens when needed.



