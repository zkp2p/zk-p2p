export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_owner",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_intentExpirationPeriod",
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
        "internalType": "bool",
        "name": "acceptAllPaymentVerifiers",
        "type": "bool"
      }
    ],
    "name": "AcceptAllPaymentVerifiersUpdated",
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
        "internalType": "address",
        "name": "depositor",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "contract IERC20",
        "name": "token",
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
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
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
        "name": "sustainabilityFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "verifierFee",
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
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "owner",
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
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "feeShare",
        "type": "uint256"
      }
    ],
    "name": "PaymentVerifierAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "feeShare",
        "type": "uint256"
      }
    ],
    "name": "PaymentVerifierFeeShareUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "verifier",
        "type": "address"
      }
    ],
    "name": "PaymentVerifierRemoved",
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
    "name": "acceptAllPaymentVerifiers",
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
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountDeposits",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "accountIntents",
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
        "name": "_verifier",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_feeShare",
        "type": "uint256"
      }
    ],
    "name": "addWhitelistedPaymentVerifier",
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
    "inputs": [
      {
        "internalType": "contract IERC20",
        "name": "_token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_amount",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "max",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Range",
        "name": "_intentAmountRange",
        "type": "tuple"
      },
      {
        "internalType": "address[]",
        "name": "_verifiers",
        "type": "address[]"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "intentGatingService",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "conversionRate",
            "type": "uint256"
          },
          {
            "internalType": "bytes32",
            "name": "payeeDetailsHash",
            "type": "bytes32"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "internalType": "struct Escrow.PaymentVerificationData[]",
        "name": "_verificationData",
        "type": "tuple[]"
      }
    ],
    "name": "createDeposit",
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
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "depositVerifierData",
    "outputs": [
      {
        "internalType": "address",
        "name": "intentGatingService",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "conversionRate",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "payeeDetailsHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
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
        "internalType": "contract IERC20",
        "name": "token",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "min",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "max",
            "type": "uint256"
          }
        ],
        "internalType": "struct Escrow.Range",
        "name": "intentAmountRange",
        "type": "tuple"
      },
      {
        "internalType": "bool",
        "name": "acceptingIntents",
        "type": "bool"
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
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_paymentProof",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "_intentHash",
        "type": "bytes32"
      }
    ],
    "name": "fulfillIntent",
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
                "internalType": "contract IERC20",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "min",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "max",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Escrow.Range",
                "name": "intentAmountRange",
                "type": "tuple"
              },
              {
                "internalType": "address[]",
                "name": "verifiers",
                "type": "address[]"
              },
              {
                "internalType": "bool",
                "name": "acceptingIntents",
                "type": "bool"
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
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct Escrow.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "verifier",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "address",
                    "name": "intentGatingService",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "conversionRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "payeeDetailsHash",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                  }
                ],
                "internalType": "struct Escrow.PaymentVerificationData",
                "name": "verificationData",
                "type": "tuple"
              }
            ],
            "internalType": "struct Escrow.VerifierDataView[]",
            "name": "verifiers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct Escrow.DepositView[]",
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
    "name": "getAccountIntents",
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
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "depositId",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "paymentVerifier",
                "type": "address"
              }
            ],
            "internalType": "struct Escrow.Intent",
            "name": "intent",
            "type": "tuple"
          }
        ],
        "internalType": "struct Escrow.IntentView[]",
        "name": "intentsArray",
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
                "internalType": "contract IERC20",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "min",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "max",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Escrow.Range",
                "name": "intentAmountRange",
                "type": "tuple"
              },
              {
                "internalType": "address[]",
                "name": "verifiers",
                "type": "address[]"
              },
              {
                "internalType": "bool",
                "name": "acceptingIntents",
                "type": "bool"
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
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct Escrow.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "verifier",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "address",
                    "name": "intentGatingService",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "conversionRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "payeeDetailsHash",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                  }
                ],
                "internalType": "struct Escrow.PaymentVerificationData",
                "name": "verificationData",
                "type": "tuple"
              }
            ],
            "internalType": "struct Escrow.VerifierDataView[]",
            "name": "verifiers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct Escrow.DepositView",
        "name": "depositView",
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
                "internalType": "contract IERC20",
                "name": "token",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "min",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "max",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Escrow.Range",
                "name": "intentAmountRange",
                "type": "tuple"
              },
              {
                "internalType": "address[]",
                "name": "verifiers",
                "type": "address[]"
              },
              {
                "internalType": "bool",
                "name": "acceptingIntents",
                "type": "bool"
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
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct Escrow.Deposit",
            "name": "deposit",
            "type": "tuple"
          },
          {
            "internalType": "uint256",
            "name": "availableLiquidity",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "verifier",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "address",
                    "name": "intentGatingService",
                    "type": "address"
                  },
                  {
                    "internalType": "uint256",
                    "name": "conversionRate",
                    "type": "uint256"
                  },
                  {
                    "internalType": "bytes32",
                    "name": "payeeDetailsHash",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "bytes",
                    "name": "data",
                    "type": "bytes"
                  }
                ],
                "internalType": "struct Escrow.PaymentVerificationData",
                "name": "verificationData",
                "type": "tuple"
              }
            ],
            "internalType": "struct Escrow.VerifierDataView[]",
            "name": "verifiers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct Escrow.DepositView[]",
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
        "name": "_intentHashes",
        "type": "bytes32[]"
      }
    ],
    "name": "getIntentsWithIntentHash",
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
                "name": "owner",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "to",
                "type": "address"
              },
              {
                "internalType": "uint256",
                "name": "depositId",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "paymentVerifier",
                "type": "address"
              }
            ],
            "internalType": "struct Escrow.Intent",
            "name": "intent",
            "type": "tuple"
          }
        ],
        "internalType": "struct Escrow.IntentView[]",
        "name": "intentArray",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
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
        "name": "owner",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "depositId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "paymentVerifier",
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
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "paymentVerifierFeeShare",
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
        "name": "_intentHash",
        "type": "bytes32"
      }
    ],
    "name": "releaseFundsToPayer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      }
    ],
    "name": "removeWhitelistedPaymentVerifier",
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
      },
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "_gatingServiceSignature",
        "type": "bytes"
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
    "inputs": [
      {
        "internalType": "bool",
        "name": "_acceptAllPaymentVerifiers",
        "type": "bool"
      }
    ],
    "name": "updateAcceptAllPaymentVerifiers",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_verifier",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_feeShare",
        "type": "uint256"
      }
    ],
    "name": "updatePaymentVerifierFeeShare",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "whitelistedPaymentVerifiers",
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
        "internalType": "uint256",
        "name": "_depositId",
        "type": "uint256"
      }
    ],
    "name": "withdrawDeposit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
