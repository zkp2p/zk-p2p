export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ramp",
        "type": "address"
      },
      {
        "internalType": "contract INullifierRegistry",
        "name": "_nullifierRegistry",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_timestampBuffer",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_endpoint",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_host",
        "type": "string"
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
    "inputs": [],
    "name": "PAYMENT_STATUS",
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
    "inputs": [],
    "name": "endpoint",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "host",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nullifierRegistry",
    "outputs": [
      {
        "internalType": "contract INullifierRegistry",
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
                "name": "transferId",
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
            "internalType": "struct IRevolutSendProcessor.SendData",
            "name": "public_values",
            "type": "tuple"
          },
          {
            "internalType": "bytes",
            "name": "proof",
            "type": "bytes"
          }
        ],
        "internalType": "struct IRevolutSendProcessor.SendProof",
        "name": "_proof",
        "type": "tuple"
      },
      {
        "internalType": "address",
        "name": "_verifierSigningKey",
        "type": "address"
      }
    ],
    "name": "processProof",
    "outputs": [
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
        "internalType": "bytes32",
        "name": "offRamperId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "currencyId",
        "type": "bytes32"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ramp",
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
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_timestampBuffer",
        "type": "uint256"
      }
    ],
    "name": "setTimestampBuffer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "timestampBuffer",
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
