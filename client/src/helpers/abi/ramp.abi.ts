export const abi = [
   {
      inputs: [
         {
            internalType: "uint256[17]",
            name: "_venmoMailserverKeys",
            type: "uint256[17]"
         },
         {
            internalType: "contract IERC20",
            name: "_usdc",
            type: "address"
         },
         {
            internalType: "uint256",
            name: "_maxAmount",
            type: "uint256"
         }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
   },
   {
      anonymous: false,
      inputs: [
         {
            indexed: true,
            internalType: "address",
            name: "previousOwner",
            type: "address"
         },
         {
            indexed: true,
            internalType: "address",
            name: "newOwner",
            type: "address"
         }
      ],
      name: "OwnershipTransferred",
      type: "event"
   },
   {
      inputs: [
         {
            internalType: "uint256[3]",
            name: "packedBytes",
            type: "uint256[3]"
         },
         {
            internalType: "uint256",
            name: "maxBytes",
            type: "uint256"
         }
      ],
      name: "_convertPackedBytesToBytes",
      outputs: [
         {
            internalType: "string",
            name: "extractedString",
            type: "string"
         }
      ],
      stateMutability: "pure",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "_orderId",
            type: "uint256"
         }
      ],
      name: "cancelOrder",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "_venmoId",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "_orderNonce",
            type: "uint256"
         },
         {
            internalType: "bytes",
            name: "_encryptedVenmoId",
            type: "bytes"
         },
         {
            internalType: "uint256",
            name: "_minAmountToPay",
            type: "uint256"
         }
      ],
      name: "claimOrder",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "_orderId",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "_claimId",
            type: "uint256"
         }
      ],
      name: "clawback",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         
      ],
      name: "getAllOrders",
      outputs: [
         {
            components: [
               {
                  internalType: "uint256",
                  name: "id",
                  type: "uint256"
               },
               {
                  components: [
                     {
                        internalType: "address",
                        name: "onRamper",
                        type: "address"
                     },
                     {
                        internalType: "bytes",
                        name: "onRamperEncryptPublicKey",
                        type: "bytes"
                     },
                     {
                        internalType: "uint256",
                        name: "amountToReceive",
                        type: "uint256"
                     },
                     {
                        internalType: "uint256",
                        name: "maxAmountToPay",
                        type: "uint256"
                     },
                     {
                        internalType: "enum Ramp.OrderStatus",
                        name: "status",
                        type: "uint8"
                     }
                  ],
                  internalType: "struct Ramp.Order",
                  name: "order",
                  type: "tuple"
               }
            ],
            internalType: "struct Ramp.OrderWithId[]",
            name: "",
            type: "tuple[]"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "_orderId",
            type: "uint256"
         }
      ],
      name: "getClaimsForOrder",
      outputs: [
         {
            components: [
               {
                  internalType: "address",
                  name: "offRamper",
                  type: "address"
               },
               {
                  internalType: "uint256",
                  name: "venmoId",
                  type: "uint256"
               },
               {
                  internalType: "enum Ramp.ClaimStatus",
                  name: "status",
                  type: "uint8"
               },
               {
                  internalType: "bytes",
                  name: "encryptedOffRamperVenmoId",
                  type: "bytes"
               },
               {
                  internalType: "uint256",
                  name: "claimExpirationTime",
                  type: "uint256"
               },
               {
                  internalType: "uint256",
                  name: "minAmountToPay",
                  type: "uint256"
               }
            ],
            internalType: "struct Ramp.OrderClaim[]",
            name: "",
            type: "tuple[]"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         
      ],
      name: "maxAmount",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "bytes32",
            name: "",
            type: "bytes32"
         }
      ],
      name: "nullified",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256[2]",
            name: "_a",
            type: "uint256[2]"
         },
         {
            internalType: "uint256[2][2]",
            name: "_b",
            type: "uint256[2][2]"
         },
         {
            internalType: "uint256[2]",
            name: "_c",
            type: "uint256[2]"
         },
         {
            internalType: "uint256[26]",
            name: "_signals",
            type: "uint256[26]"
         }
      ],
      name: "onRamp",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      name: "orderClaimNonce",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      name: "orderClaimedByVenmoId",
      outputs: [
         {
            internalType: "bool",
            name: "",
            type: "bool"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      name: "orderClaims",
      outputs: [
         {
            internalType: "address",
            name: "offRamper",
            type: "address"
         },
         {
            internalType: "uint256",
            name: "venmoId",
            type: "uint256"
         },
         {
            internalType: "enum Ramp.ClaimStatus",
            name: "status",
            type: "uint8"
         },
         {
            internalType: "bytes",
            name: "encryptedOffRamperVenmoId",
            type: "bytes"
         },
         {
            internalType: "uint256",
            name: "claimExpirationTime",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "minAmountToPay",
            type: "uint256"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         
      ],
      name: "orderNonce",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      name: "orders",
      outputs: [
         {
            internalType: "address",
            name: "onRamper",
            type: "address"
         },
         {
            internalType: "bytes",
            name: "onRamperEncryptPublicKey",
            type: "bytes"
         },
         {
            internalType: "uint256",
            name: "amountToReceive",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "maxAmountToPay",
            type: "uint256"
         },
         {
            internalType: "enum Ramp.OrderStatus",
            name: "status",
            type: "uint8"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         
      ],
      name: "owner",
      outputs: [
         {
            internalType: "address",
            name: "",
            type: "address"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "_amount",
            type: "uint256"
         },
         {
            internalType: "uint256",
            name: "_maxAmountToPay",
            type: "uint256"
         },
         {
            internalType: "bytes",
            name: "_encryptPublicKey",
            type: "bytes"
         }
      ],
      name: "postOrder",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         
      ],
      name: "renounceOwnership",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "_maxAmount",
            type: "uint256"
         }
      ],
      name: "setMaxAmount",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256[17]",
            name: "_venmoMailserverKeys",
            type: "uint256[17]"
         }
      ],
      name: "setVenmoMailserverKeys",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "address",
            name: "newOwner",
            type: "address"
         }
      ],
      name: "transferOwnership",
      outputs: [
         
      ],
      stateMutability: "nonpayable",
      type: "function"
   },
   {
      inputs: [
         
      ],
      name: "usdc",
      outputs: [
         {
            internalType: "contract IERC20",
            name: "",
            type: "address"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      name: "venmoMailserverKeys",
      outputs: [
         {
            internalType: "uint256",
            name: "",
            type: "uint256"
         }
      ],
      stateMutability: "view",
      type: "function"
   },
   {
      inputs: [
         {
            internalType: "uint256[2]",
            name: "a",
            type: "uint256[2]"
         },
         {
            internalType: "uint256[2][2]",
            name: "b",
            type: "uint256[2][2]"
         },
         {
            internalType: "uint256[2]",
            name: "c",
            type: "uint256[2]"
         },
         {
            internalType: "uint256[26]",
            name: "input",
            type: "uint256[26]"
         }
      ],
      name: "verifyProof",
      outputs: [
         {
            internalType: "bool",
            name: "r",
            type: "bool"
         }
      ],
      stateMutability: "view",
      type: "function"
   }
];
