export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ramp",
        "type": "address"
      },
      {
        "internalType": "contract IKeyHashAdapterV2",
        "name": "_garantiMailserverKeyHashAdapter",
        "type": "address"
      },
      {
        "internalType": "contract INullifierRegistry",
        "name": "_nullifierRegistry",
        "type": "address"
      },
      {
        "internalType": "contract IGarantiBodySuffixHashVerifier",
        "name": "_bodyHashVerifier",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_emailFromAddress",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_timestampBuffer",
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
    "name": "bodyHashVerifier",
    "outputs": [
      {
        "internalType": "contract IGarantiBodySuffixHashVerifier",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "emailFromAddress",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getEmailFromAddress",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_keyHash",
        "type": "bytes32"
      }
    ],
    "name": "isMailServerKeyHash",
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
    "name": "mailServerKeyHashAdapter",
    "outputs": [
      {
        "internalType": "contract IKeyHashAdapterV2",
        "name": "",
        "type": "address"
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
            "internalType": "uint256[2]",
            "name": "a",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2][2]",
            "name": "b",
            "type": "uint256[2][2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "c",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[28]",
            "name": "signals",
            "type": "uint256[28]"
          }
        ],
        "internalType": "struct IGarantiSendProcessor.SendProof",
        "name": "_proof",
        "type": "tuple"
      },
      {
        "components": [
          {
            "internalType": "uint256[2]",
            "name": "a",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[2][2]",
            "name": "b",
            "type": "uint256[2][2]"
          },
          {
            "internalType": "uint256[2]",
            "name": "c",
            "type": "uint256[2]"
          },
          {
            "internalType": "uint256[4]",
            "name": "signals",
            "type": "uint256[4]"
          }
        ],
        "internalType": "struct IGarantiBodySuffixHashVerifier.BodySuffixHashProof",
        "name": "_bodyHashProof",
        "type": "tuple"
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
        "name": "offRamperNameHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "offRamperIdHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "onRamperIdHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "intentHash",
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
        "internalType": "string",
        "name": "_emailFromAddress",
        "type": "string"
      }
    ],
    "name": "setEmailFromAddress",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "contract IKeyHashAdapterV2",
        "name": "_mailServerKeyHashAdapter",
        "type": "address"
      }
    ],
    "name": "setMailserverKeyHashAdapter",
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
  },
  {
    "inputs": [
      {
        "internalType": "uint256[2]",
        "name": "_pA",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[2][2]",
        "name": "_pB",
        "type": "uint256[2][2]"
      },
      {
        "internalType": "uint256[2]",
        "name": "_pC",
        "type": "uint256[2]"
      },
      {
        "internalType": "uint256[28]",
        "name": "_pubSignals",
        "type": "uint256[28]"
      }
    ],
    "name": "verifyProof",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
