export const abi = [
  {
    "inputs": [
      {
        "internalType": "contract IEscrow",
        "name": "_escrow",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [],
    "name": "escrow",
    "outputs": [
      {
        "internalType": "contract IEscrow",
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
      },
      {
        "internalType": "address",
        "name": "_paymentVerifier",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_gatingService",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_receiveToken",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_sendCurrency",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_exactFiatAmount",
        "type": "uint256"
      }
    ],
    "name": "quoteMaxTokenOutputForExactFiatInput",
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
                "internalType": "struct IEscrow.Range",
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
              },
              {
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct IEscrow.Deposit",
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
                "internalType": "struct IEscrow.DepositVerifierData",
                "name": "verificationData",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "internalType": "bytes32",
                    "name": "code",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "uint256",
                    "name": "conversionRate",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct IEscrow.Currency[]",
                "name": "currencies",
                "type": "tuple[]"
              }
            ],
            "internalType": "struct IEscrow.VerifierDataView[]",
            "name": "verifiers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct IEscrow.DepositView",
        "name": "bestDeposit",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "maxTokenAmount",
        "type": "uint256"
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
      },
      {
        "internalType": "address",
        "name": "_paymentVerifier",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_gatingService",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_receiveToken",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "_sendCurrency",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "_exactTokenAmount",
        "type": "uint256"
      }
    ],
    "name": "quoteMinFiatInputForExactTokenOutput",
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
                "internalType": "struct IEscrow.Range",
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
              },
              {
                "internalType": "bytes32[]",
                "name": "intentHashes",
                "type": "bytes32[]"
              }
            ],
            "internalType": "struct IEscrow.Deposit",
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
                "internalType": "struct IEscrow.DepositVerifierData",
                "name": "verificationData",
                "type": "tuple"
              },
              {
                "components": [
                  {
                    "internalType": "bytes32",
                    "name": "code",
                    "type": "bytes32"
                  },
                  {
                    "internalType": "uint256",
                    "name": "conversionRate",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct IEscrow.Currency[]",
                "name": "currencies",
                "type": "tuple[]"
              }
            ],
            "internalType": "struct IEscrow.VerifierDataView[]",
            "name": "verifiers",
            "type": "tuple[]"
          }
        ],
        "internalType": "struct IEscrow.DepositView",
        "name": "bestDeposit",
        "type": "tuple"
      },
      {
        "internalType": "uint256",
        "name": "minFiatAmount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
  