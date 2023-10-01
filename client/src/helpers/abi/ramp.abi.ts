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
        "internalType": "contract IPoseidon",
        "name": "_poseidon",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_minDepositAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_convenienceRewardTimePeriod",
        "type": "uint256"
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
        "name": "venmoIdHash",
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
        "name": "convenienceRewardTimePeriod",
        "type": "uint256"
      }
    ],
    "name": "ConvenienceRewardTimePeriodSet",
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
        "name": "venmoId",
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
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "convenienceFee",
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
        "name": "convenienceFee",
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
        "name": "venmoId",
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
    "inputs": [],
    "name": "convenienceRewardTimePeriod",
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
      },
      {
        "internalType": "uint256",
        "name": "convenienceFee",
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
            "internalType": "address",
            "name": "depositor",
            "type": "address"
          },
          {
            "internalType": "uint256[3]",
            "name": "packedVenmoId",
            "type": "uint256[3]"
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
            "internalType": "uint256",
            "name": "convenienceFee",
            "type": "uint256"
          },
          {
            "internalType": "bytes32[]",
            "name": "intentHashes",
            "type": "bytes32[]"
          }
        ],
        "internalType": "struct Ramp.Deposit[]",
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
            "name": "venmoIdHash",
            "type": "bytes32"
          },
          {
            "internalType": "uint256[]",
            "name": "deposits",
            "type": "uint256[]"
          }
        ],
        "internalType": "struct Ramp.AccountInfo",
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
            "internalType": "uint256[3]",
            "name": "packedVenmoId",
            "type": "uint256[3]"
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
            "internalType": "uint256",
            "name": "convenienceFee",
            "type": "uint256"
          },
          {
            "internalType": "bytes32[]",
            "name": "intentHashes",
            "type": "bytes32[]"
          }
        ],
        "internalType": "struct Ramp.Deposit",
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
            "internalType": "address",
            "name": "depositor",
            "type": "address"
          },
          {
            "internalType": "uint256[3]",
            "name": "packedVenmoId",
            "type": "uint256[3]"
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
            "internalType": "uint256",
            "name": "convenienceFee",
            "type": "uint256"
          },
          {
            "internalType": "bytes32[]",
            "name": "intentHashes",
            "type": "bytes32[]"
          }
        ],
        "internalType": "struct Ramp.Deposit[]",
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
        "internalType": "bytes32[]",
        "name": "_intentIds",
        "type": "bytes32[]"
      }
    ],
    "name": "getIntentFromIds",
    "outputs": [
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
        "internalType": "struct Ramp.Intent[]",
        "name": "intentArray",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IReceiveProcessor",
        "name": "_receiveProcessor",
        "type": "address"
      },
      {
        "internalType": "contract IRegistrationProcessor",
        "name": "_registrationProcessor",
        "type": "address"
      },
      {
        "internalType": "contract ISendProcessor",
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
        "internalType": "uint256[3]",
        "name": "_packedVenmoId",
        "type": "uint256[3]"
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
        "internalType": "uint256",
        "name": "_convenienceFee",
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
        "internalType": "uint256[8]",
        "name": "_signals",
        "type": "uint256[8]"
      }
    ],
    "name": "onRamp",
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
        "internalType": "uint256[9]",
        "name": "_signals",
        "type": "uint256[9]"
      }
    ],
    "name": "onRampWithConvenience",
    "outputs": [],
    "stateMutability": "nonpayable",
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
    "name": "poseidon",
    "outputs": [
      {
        "internalType": "contract IPoseidon",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "receiveProcessor",
    "outputs": [
      {
        "internalType": "contract IReceiveProcessor",
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
        "internalType": "contract ISendProcessor",
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
        "name": "_convenienceRewardTimePeriod",
        "type": "uint256"
      }
    ],
    "name": "setConvenienceRewardTimePeriod",
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
        "internalType": "contract IReceiveProcessor",
        "name": "_receiveProcessor",
        "type": "address"
      }
    ],
    "name": "setReceiveProcessor",
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
        "internalType": "contract ISendProcessor",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "venmoIdIntent",
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
