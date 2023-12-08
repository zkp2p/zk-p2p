export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "contract IERC20",
        "name": "_usdc",
        "type": "address"
      },
      {
        "internalType": "contract IPoseidon3",
        "name": "_poseidon3",
        "type": "address"
      },
      {
        "internalType": "contract IPoseidon6",
        "name": "_poseidon6",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_minDepositAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_maxOnRampAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_intentExpirationPeriod",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_onRampCooldownPeriod",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_sustainabilityFee",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_sustainabilityFeeRecipient",
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
        "name": "idHash",
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
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "depositor",
        "type": "address"
      }
    ],
    "name": "DepositClosed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "idHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "conversionRate",
        "type": "uint256"
      }
    ],
    "name": "DepositReceived",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "depositor",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "DepositWithdrawn",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "intentExpirationPeriod",
        "type": "uint256"
      }
    ],
    "name": "IntentExpirationPeriodSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "intentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "onRamper",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "feeAmount",
        "type": "uint256"
      }
    ],
    "name": "IntentFulfilled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "intentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      }
    ],
    "name": "IntentPruned",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "intentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "idHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "IntentSignaled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxOnRampAmount",
        "type": "uint256"
      }
    ],
    "name": "MaxOnRampAmountSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "minDepositAmount",
        "type": "uint256"
      }
    ],
    "name": "MinDepositAmountSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "receiveProcessor",
        "type": "address"
      }
    ],
    "name": "NewReceiveProcessorSet",
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
    "name": "NewRegistrationProcessorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "sendProcessor",
        "type": "address"
      }
    ],
    "name": "NewSendProcessorSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "onRampCooldownPeriod",
        "type": "uint256"
      }
    ],
    "name": "OnRampCooldownPeriodSet",
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
        "indexed": false,
        "internalType": "address",
        "name": "feeRecipient",
        "type": "address"
      }
    ],
    "name": "SustainabilityFeeRecipientUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "fee",
        "type": "uint256"
      }
    ],
    "name": "SustainabilityFeeUpdated",
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
        "internalType": "bytes32",
        "name": "_intentHash",
        "type": "bytes32"
      }
    ],
    "name": "cancelIntent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "depositCounter",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "deposits",
    "outputs": [
      {
        "internalType": "address",
        "name": "depositor",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "depositAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "remainingDeposits",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "outstandingIntentAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "conversionRate",
        "type": "uint256"
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
    "name": "getAccountDeposits",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "depositId",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "depositor",
                "type": "address"
              },
              {
                "internalType": "uint256[8]",
                "name": "upiId",
                "type": "uint256[8]"
              },
              {
                "internalType": "uint256",
                "name": "depositAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "remainingDeposits",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "outstandingIntentAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "conversionRate",
                "type": "uint256"
              },
              {
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct HDFCRamp.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          }
        ],
        "internalType": "struct HDFCRamp.DepositWithAvailableLiquidity[]",
        "name": "accountDeposits",
        "type": "tuple[]"
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
            "name": "idHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256[]",
            "name": "deposits",
            "type": "uint256[]"
          }
        ],
        "internalType": "struct HDFCRamp.AccountInfo",
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
        "internalType": "uint256",
        "name": "_depositId",
        "type": "uint256"
      }
    ],
    "name": "getDeposit",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "depositor",
            "type": "address"
          },
          {
            "internalType": "uint256[8]",
            "name": "upiId",
            "type": "uint256[8]"
          },
          {
            "internalType": "uint256",
            "name": "depositAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "remainingDeposits",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "outstandingIntentAmount",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "conversionRate",
            "type": "uint256"
          },
          {
            "internalType": "bytes32[]",
            "name": "intentHashes",
            "type": "bytes32[]"
          }
        ],
        "internalType": "struct HDFCRamp.Deposit",
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
        "internalType": "uint256[]",
        "name": "_depositIds",
        "type": "uint256[]"
      }
    ],
    "name": "getDepositFromIds",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "depositId",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "depositor",
                "type": "address"
              },
              {
                "internalType": "uint256[8]",
                "name": "upiId",
                "type": "uint256[8]"
              },
              {
                "internalType": "uint256",
                "name": "depositAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "remainingDeposits",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "outstandingIntentAmount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "conversionRate",
                "type": "uint256"
              },
              {
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct HDFCRamp.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          }
        ],
        "internalType": "struct HDFCRamp.DepositWithAvailableLiquidity[]",
        "name": "depositArray",
        "type": "tuple[]"
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
    "name": "getIdCurrentIntentHash",
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
        "internalType": "bytes32[]",
        "name": "_intentHashes",
        "type": "bytes32[]"
      }
    ],
    "name": "getIntentsWithOnRamperId",
    "outputs": [
      {
        "components": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "onRamper",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "deposit",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "intentTimestamp",
                "type": "uint256"
              }
            ],
            "internalType": "struct HDFCRamp.Intent",
            "name": "intent",
            "type": "tuple"
          },
          {
            "internalType": "bytes32",
            "name": "onRamperIdHash",
            "type": "bytes32"
          }
        ],
        "internalType": "struct HDFCRamp.IntentWithOnRamperId[]",
        "name": "",
        "type": "tuple[]"
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
    "name": "getLastOnRampTimestamp",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IRegistrationProcessor",
        "name": "_registrationProcessor",
        "type": "address"
      },
      {
        "internalType": "contract IHDFCSendProcessor",
        "name": "_sendProcessor",
        "type": "address"
      }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "intentExpirationPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "intents",
    "outputs": [
      {
        "internalType": "address",
        "name": "onRamper",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "deposit",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "intentTimestamp",
        "type": "uint256"
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
    "name": "maxOnRampAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "minDepositAmount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[8]",
        "name": "_upiId",
        "type": "uint256[8]"
      },
      {
        "internalType": "uint256",
        "name": "_depositAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_receiveAmount",
        "type": "uint256"
      }
    ],
    "name": "offRamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256[2]",
        "name": "_a",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "_b",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "_c",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[15]",
        "name": "_signals",
        "type": "uint256[15]"
      }
    ],
    "name": "onRamp",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "onRampCooldownPeriod",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
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
    "inputs": [],
    "name": "poseidon3",
    "outputs": [
      {
        "internalType": "contract IPoseidon3",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "poseidon6",
    "outputs": [
      {
        "internalType": "contract IPoseidon6",
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
        "internalType": "uint256[2]",
        "name": "_a",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "_b",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "_c",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[5]",
        "name": "_signals",
        "type": "uint256[5]"
      }
    ],
    "name": "register",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "registrationProcessor",
    "outputs": [
      {
        "internalType": "contract IRegistrationProcessor",
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
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sendProcessor",
    "outputs": [
      {
        "internalType": "contract IHDFCSendProcessor",
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
        "internalType": "uint256",
        "name": "_intentExpirationPeriod",
        "type": "uint256"
      }
    ],
    "name": "setIntentExpirationPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_maxOnRampAmount",
        "type": "uint256"
      }
    ],
    "name": "setMaxOnRampAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_minDepositAmount",
        "type": "uint256"
      }
    ],
    "name": "setMinDepositAmount",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_onRampCooldownPeriod",
        "type": "uint256"
      }
    ],
    "name": "setOnRampCooldownPeriod",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IRegistrationProcessor",
        "name": "_registrationProcessor",
        "type": "address"
      }
    ],
    "name": "setRegistrationProcessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IHDFCSendProcessor",
        "name": "_sendProcessor",
        "type": "address"
      }
    ],
    "name": "setSendProcessor",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_fee",
        "type": "uint256"
      }
    ],
    "name": "setSustainabilityFee",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_feeRecipient",
        "type": "address"
      }
    ],
    "name": "setSustainabilityFeeRecipient",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_depositId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "_to",
        "type": "address"
      }
    ],
    "name": "signalIntent",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sustainabilityFee",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "sustainabilityFeeRecipient",
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
        "internalType": "address",
        "name": "newOwner",
        "type": "address"
      }
    ],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdc",
    "outputs": [
      {
        "internalType": "contract IERC20",
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
        "internalType": "uint256[]",
        "name": "_depositIds",
        "type": "uint256[]"
      }
    ],
    "name": "withdrawDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]
