export const abi = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_ramp",
        "type": "address"
      },
      {
        "internalType": "contract IKeyHashAdapter",
        "name": "_venmoMailserverKeyHashAdapter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "_emailFromAddress",
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
    "inputs": [],
    "name": "getVenmoMailserverKeyHash",
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
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "isEmailNullified",
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
            "internalType": "uint256[10]",
            "name": "signals",
            "type": "uint256[10]"
          }
        ],
        "internalType": "struct ISendProcessor.SendProof",
        "name": "_proof",
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
        "name": "offRamperIdHash",
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
        "internalType": "contract IKeyHashAdapter",
        "name": "_venmoMailserverKeyHashAdapter",
        "type": "address"
      }
    ],
    "name": "setVenmoMailserverKeyHashAdapter",
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
    "name": "venmoMailserverKeyHashAdapter",
    "outputs": [
      {
        "internalType": "contract IKeyHashAdapter",
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
        "internalType": "uint256[10]",
        "name": "_pubSignals",
        "type": "uint256[10]"
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
