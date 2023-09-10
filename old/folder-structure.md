project_root/
│
├── smart_contracts/
│   ├── MasterContract.sol
│   ├── BridgeContract.sol
│   ├── MarketplaceContract.sol
│   └── ERC20CO2Token.sol
│
├── backend/
│   ├── app.js
│   ├── config.js
│   ├── package.json
│   └── .env
│   ├── api/
│   │   ├── routes.js
│   │   ├── controllers/
│   │   │   ├── carbonCreditsController.js
│   │   │   ├── marketplaceController.js
│   │   │   └── userController.js
│   │   └── services/
│   │       ├── carbonCreditsService.js
│   │       ├── marketplaceService.js
│   │       └── userService.js
│   └── utils/
│       ├── ipfsUtils.js
│       ├── tronUtils.js
│       └── web3Utils.js
│
└── frontend/
    ├── index.html
    ├── style.css
    ├── main.js
    ├── components/
    │   ├── CarbonCreditsList.js
    │   ├── BuyCarbonCredits.js
    │   ├── SellCarbonCredits.js
    │   ├── OffsetCarbonCredits.js
    │   ├── UserWallet.js
    │   └── CarbonCreditsVerification.js
    ├── services/
    │   ├── carbonCreditsService.js
    │   ├── marketplaceService.js
    │   └── userService.js
    └── utils/
        ├── ipfsUtils.js
        ├── tronUtils.js
        └── web3Utils.js
