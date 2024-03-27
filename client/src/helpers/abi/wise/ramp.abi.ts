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
        "name": "offRampId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "currencyId",
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
        "name": "accountId",
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
    "inputs": [],
    "name": "accountRegistry",
    "outputs": [
      {
        "internalType": "contract IWiseAccountRegistry",
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
        "internalType": "string",
        "name": "wiseTag",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "verifierSigningKey",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "depositAmount",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "receiveCurrencyId",
        "type": "bytes32"
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
            "internalType": "bytes32",
            "name": "depositorId",
            "type": "bytes32"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "depositor",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "wiseTag",
                "type": "string"
              },
              {
                "internalType": "address",
                "name": "verifierSigningKey",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "depositAmount",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "receiveCurrencyId",
                "type": "bytes32"
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
            "internalType": "struct WiseRamp.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          }
        ],
        "internalType": "struct WiseRamp.DepositWithAvailableLiquidity[]",
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
            "internalType": "string",
            "name": "wiseTag",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "verifierSigningKey",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "depositAmount",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "receiveCurrencyId",
            "type": "bytes32"
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
        "internalType": "struct WiseRamp.Deposit",
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
            "internalType": "bytes32",
            "name": "depositorId",
            "type": "bytes32"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "depositor",
                "type": "address"
              },
              {
                "internalType": "string",
                "name": "wiseTag",
                "type": "string"
              },
              {
                "internalType": "address",
                "name": "verifierSigningKey",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "depositAmount",
                "type": "uint256"
              },
              {
                "internalType": "bytes32",
                "name": "receiveCurrencyId",
                "type": "bytes32"
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
            "internalType": "struct WiseRamp.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          }
        ],
        "internalType": "struct WiseRamp.DepositWithAvailableLiquidity[]",
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
        "internalType": "address",
        "name": "_account",
        "type": "address"
      }
    ],
    "name": "getIdCurrentIntentHashAsUint",
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
            "internalType": "bytes32",
            "name": "intentHash",
            "type": "bytes32"
          },
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
            "internalType": "struct WiseRamp.Intent",
            "name": "intent",
            "type": "tuple"
          },
          {
            "internalType": "bytes32",
            "name": "onRamperId",
            "type": "bytes32"
          }
        ],
        "internalType": "struct WiseRamp.IntentWithOnRamperId[]",
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
        "internalType": "contract IWiseAccountRegistry",
        "name": "_accountRegistry",
        "type": "address"
      },
      {
        "internalType": "contract IWiseSendProcessor",
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
        "internalType": "string",
        "name": "_wiseTag",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "_receiveCurrencyId",
        "type": "bytes32"
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
      },
      {
        "internalType": "address",
        "name": "_verifierSigningKey",
        "type": "address"
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
            "name": "transferId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "senderId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "recipientId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "amount",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "currencyId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "status",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "timestamp",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "intentHash",
            "type": "uint256"
          }
        ],
        "internalType": "struct IWiseSendProcessor.SendData",
        "name": "_sendData",
        "type": "tuple"
      },
      {
        "internalType": "bytes",
        "name": "_verifierSignature",
        "type": "bytes"
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
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_intentHash",
        "type": "bytes32"
      }
    ],
    "name": "releaseFundsToOnramper",
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
        "internalType": "contract IWiseSendProcessor",
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
        "internalType": "contract IWiseSendProcessor",
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
];
