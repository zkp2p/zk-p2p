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
         "internalType": "bytes32",
         "name": "venmoId",
         "type": "bytes32"
       },
       {
         "indexed": false,
         "internalType": "address",
         "name": "newOwner",
         "type": "address"
       }
     ],
     "name": "AccountOwnerUpdated",
     "type": "event"
   },
   {
     "anonymous": false,
     "inputs": [
       {
         "indexed": true,
         "internalType": "bytes32",
         "name": "accountId",
         "type": "bytes32"
       },
       {
         "indexed": true,
         "internalType": "address",
         "name": "account",
         "type": "address"
       }
     ],
     "name": "AccountRegistered",
     "type": "event"
   },
   {
     "anonymous": false,
     "inputs": [
       {
         "indexed": true,
         "internalType": "bytes32",
         "name": "depositHash",
         "type": "bytes32"
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
         "internalType": "bytes32",
         "name": "depositHash",
         "type": "bytes32"
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
         "internalType": "bytes32",
         "name": "depositHash",
         "type": "bytes32"
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
         "internalType": "bytes32",
         "name": "depositHash",
         "type": "bytes32"
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
         "internalType": "bytes32",
         "name": "depositHash",
         "type": "bytes32"
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
     "name": "PRECISE_UNIT",
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
     "name": "accountIds",
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
     "inputs": [
       {
         "internalType": "bytes32",
         "name": "",
         "type": "bytes32"
       }
     ],
     "name": "deposits",
     "outputs": [
       {
         "internalType": "bytes32",
         "name": "depositor",
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
         "internalType": "bytes32",
         "name": "_depositHash",
         "type": "bytes32"
       }
     ],
     "name": "getDeposit",
     "outputs": [
       {
         "components": [
           {
             "internalType": "bytes32",
             "name": "depositor",
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
         "internalType": "bytes32",
         "name": "",
         "type": "bytes32"
       }
     ],
     "name": "intents",
     "outputs": [
       {
         "internalType": "bytes32",
         "name": "onramper",
         "type": "bytes32"
       },
       {
         "internalType": "bytes32",
         "name": "deposit",
         "type": "bytes32"
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
         "internalType": "bytes32",
         "name": "_venmoId",
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
         "internalType": "uint256[51]",
         "name": "_signals",
         "type": "uint256[51]"
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
         "internalType": "uint256[51]",
         "name": "_signals",
         "type": "uint256[51]"
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
         "internalType": "uint256[45]",
         "name": "_signals",
         "type": "uint256[45]"
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
         "internalType": "bytes32",
         "name": "_venmoId",
         "type": "bytes32"
       },
       {
         "internalType": "address",
         "name": "_newOwner",
         "type": "address"
       }
     ],
     "name": "setAccountOwner",
     "outputs": [],
     "stateMutability": "nonpayable",
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
         "internalType": "bytes32",
         "name": "_venmoId",
         "type": "bytes32"
       },
       {
         "internalType": "bytes32",
         "name": "_depositHash",
         "type": "bytes32"
       },
       {
         "internalType": "uint256",
         "name": "_amount",
         "type": "uint256"
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
         "internalType": "bytes32[]",
         "name": "_depositHashes",
         "type": "bytes32[]"
       }
     ],
     "name": "withdrawDeposit",
     "outputs": [],
     "stateMutability": "nonpayable",
     "type": "function"
   }
];