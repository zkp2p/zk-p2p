export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "accountOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "accountId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "wiseTagHash",
        "type": "bytes32"
      }
    ],
    "name": "AccountRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "listOwner",
        "type": "bytes32"
      }
    ],
    "name": "AllowlistEnabled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "registrationProcessor",
        "type": "address"
      }
    ],
    "name": "NewAccountRegistrationProcessorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "registrationProcessor",
        "type": "address"
      }
    ],
    "name": "NewOffRamperRegistrationProcessorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "accountOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "accountId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "offRampId",
        "type": "bytes32"
      }
    ],
    "name": "OffRamperRegistered",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "previousOwner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "listOwner",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "allowedUser",
        "type": "bytes32"
      }
    ],
    "name": "UserAddedToAllowlist",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "listOwner",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "deniedUser",
        "type": "bytes32"
      }
    ],
    "name": "UserAddedToDenylist",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "listOwner",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "allowedUser",
        "type": "bytes32"
      }
    ],
    "name": "UserRemovedFromAllowlist",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "listOwner",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "approvedUser",
        "type": "bytes32"
      }
    ],
    "name": "UserRemovedFromDenylist",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "accountRegistrationProcessor",
    "outputs": [
      {
        "internalType": "contract IWiseAccountRegistrationProcessor",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_deniedUser",
        "type": "bytes32"
      }
    ],
    "name": "addAccountToDenylist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "_allowedUsers",
        "type": "bytes32[]"
      }
    ],
    "name": "addAccountsToAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "enableAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "getAccountId",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "getAccountInfo",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "accountId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "offRampId",
            "type": "bytes32"
          },
          {
            "internalType": "bytes32",
            "name": "wiseTagHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct IWiseAccountRegistry.AccountInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "getAllowedUsers",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "getDeniedUsers",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IWiseAccountRegistrationProcessor",
        "name": "_accountRegistrationProcessor",
        "type": "address"
      },
      {
        "internalType": "contract IWiseOffRamperRegistrationProcessor",
        "name": "_offRamperRegistrationProcessor",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_allowedUser",
        "type": "bytes32"
      }
    ],
    "name": "isAllowedUser",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "isAllowlistEnabled",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_deniedUser",
        "type": "bytes32"
      }
    ],
    "name": "isDeniedUser",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isInitialized",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "isRegisteredUser",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "offRamperRegistrationProcessor",
    "outputs": [
      {
        "internalType": "contract IWiseOffRamperRegistrationProcessor",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "endpoint",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "host",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "profileId",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "wiseTagHash",
                "type": "string"
              }
            ],
            "internalType": "struct IWiseAccountRegistrationProcessor.RegistrationData",
            "name": "public_values",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "proof",
            "type": "bytes"
          }
        ],
        "internalType": "struct IWiseAccountRegistrationProcessor.RegistrationProof",
        "name": "_proof",
        "type": "tuple"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "endpoint",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "host",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "profileId",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "mcAccountId",
                "type": "string"
              }
            ],
            "internalType": "struct IWiseOffRamperRegistrationProcessor.OffRamperRegistrationData",
            "name": "public_values",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "proof",
            "type": "bytes"
          }
        ],
        "internalType": "struct IWiseOffRamperRegistrationProcessor.OffRamperRegistrationProof",
        "name": "_proof",
        "type": "tuple"
      }
    ],
    "name": "registerAsOffRamper",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_approvedUser",
        "type": "bytes32"
      }
    ],
    "name": "removeAccountFromDenylist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "_disallowedUsers",
        "type": "bytes32[]"
      }
    ],
    "name": "removeAccountsFromAllowlist",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IWiseAccountRegistrationProcessor",
        "name": "_registrationProcessor",
        "type": "address"
      }
    ],
    "name": "setAccountRegistrationProcessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IWiseOffRamperRegistrationProcessor",
        "name": "_registrationProcessor",
        "type": "address"
      }
    ],
    "name": "setOffRamperRegistrationProcessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
