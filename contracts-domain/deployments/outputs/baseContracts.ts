export default {
  "name": "base",
  "chainId": "8453",
  "contracts": {
    "ClaimVerifier": {
      "address": "0xBA4D6eA209c3C3A6B0B31fE136a5F0eFd9De2bd1",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            },
            {
              "internalType": "uint8",
              "name": "maxValues",
              "type": "uint8"
            },
            {
              "internalType": "bool",
              "name": "extractProviderHash",
              "type": "bool"
            }
          ],
          "name": "extractAllFromContext",
          "outputs": [
            {
              "internalType": "string[]",
              "name": "",
              "type": "string[]"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "prefix",
              "type": "string"
            }
          ],
          "name": "extractFieldFromContext",
          "outputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "data",
              "type": "string"
            },
            {
              "internalType": "string",
              "name": "target",
              "type": "string"
            }
          ],
          "name": "findSubstringEndIndex",
          "outputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        }
      ]
    },
    "DomainExchange": {
      "address": "0x054be4cFB6e951A7dE921A179FA323c5ea3fCf47",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_owner",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_fee",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "_feeRecipient",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "_bidSettlementPeriod",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_bidRefundPeriod",
              "type": "uint256"
            },
            {
              "internalType": "address[]",
              "name": "_allowedAddresses",
              "type": "address[]"
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
              "name": "allowedAddress",
              "type": "address"
            }
          ],
          "name": "AddressAddedToAllowlist",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "allowedAddress",
              "type": "address"
            }
          ],
          "name": "AddressRemovedFromAllowlist",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "AllowlistDisabled",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [],
          "name": "AllowlistEnabled",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "bidId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            }
          ],
          "name": "BidCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "bidId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newPrice",
              "type": "uint256"
            }
          ],
          "name": "BidPriceIncreased",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newBidRefundPeriod",
              "type": "uint256"
            }
          ],
          "name": "BidRefundPeriodUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newBidSettlementPeriod",
              "type": "uint256"
            }
          ],
          "name": "BidSettlementPeriodUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "bidId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            }
          ],
          "name": "BidWithdrawn",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "newFeeRecipient",
              "type": "address"
            }
          ],
          "name": "FeeRecipientUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newFee",
              "type": "uint256"
            }
          ],
          "name": "FeeUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "bool",
              "name": "instantAccept",
              "type": "bool"
            }
          ],
          "name": "InstantAcceptUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "domainId",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "dkimKeyHash",
              "type": "bytes32"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "askPrice",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "minBidPrice",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "saleEthRecipient",
              "type": "address"
            }
          ],
          "name": "ListingCreated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "seller",
              "type": "address"
            }
          ],
          "name": "ListingDeleted",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            }
          ],
          "name": "ListingDeletedByRegistry",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "newAskPrice",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "address",
              "name": "saleEthRecipient",
              "type": "address"
            }
          ],
          "name": "ListingUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "contract IKeyHashAdapterV2",
              "name": "newMailServerKeyHashAdapter",
              "type": "address"
            }
          ],
          "name": "MailServerKeyHashAdapterUpdated",
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
              "name": "account",
              "type": "address"
            }
          ],
          "name": "Paused",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "bidId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            }
          ],
          "name": "RefundInitiated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "bidId",
              "type": "uint256"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "priceNetFees",
              "type": "uint256"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "fees",
              "type": "uint256"
            }
          ],
          "name": "SaleFinalized",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "contract ITransferDomainProcessor",
              "name": "newTransferDomainProcessor",
              "type": "address"
            }
          ],
          "name": "TransferDomainProcessorUpdated",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "account",
              "type": "address"
            }
          ],
          "name": "Unpaused",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "_allowedAddresses",
              "type": "address[]"
            }
          ],
          "name": "addAddressesToAllowlist",
          "outputs": [],
          "stateMutability": "nonpayable",
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
          "name": "allowedAddresses",
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
          "name": "bidCounter",
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
          "name": "bidRefundPeriod",
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
          "name": "bidSettlementPeriod",
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
          "name": "bids",
          "outputs": [
            {
              "internalType": "address",
              "name": "buyer",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            },
            {
              "internalType": "string",
              "name": "encryptedBuyerId",
              "type": "string"
            },
            {
              "internalType": "bytes32",
              "name": "buyerIdHash",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "expiryTimestamp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "price",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "refundInitiated",
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
              "name": "_bidId",
              "type": "uint256"
            }
          ],
          "name": "buyerReleaseFunds",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_listingId",
              "type": "uint256"
            },
            {
              "internalType": "bytes32",
              "name": "_buyerIdHash",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "_encryptedBuyerId",
              "type": "string"
            }
          ],
          "name": "createBid",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_domainId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_askPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_minBidPrice",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "_saleEthRecipient",
              "type": "address"
            },
            {
              "internalType": "bytes",
              "name": "_encryptionKey",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "_dkimKeyHash",
              "type": "bytes32"
            }
          ],
          "name": "createListing",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_listingId",
              "type": "uint256"
            }
          ],
          "name": "deleteListing",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "disableAllowlist",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "disableInstantAccept",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "enableAllowlist",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "enableInstantAccept",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "fee",
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
          "name": "feeRecipient",
          "outputs": [
            {
              "internalType": "address payable",
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
              "internalType": "struct ITransferDomainProcessor.TransferProof",
              "name": "_proof",
              "type": "tuple"
            }
          ],
          "name": "finalizeSale",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getAllowedSellers",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "_listingIds",
              "type": "uint256[]"
            }
          ],
          "name": "getListingBids",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "bidId",
                  "type": "uint256"
                },
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "buyer",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "listingId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "string",
                      "name": "encryptedBuyerId",
                      "type": "string"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "buyerIdHash",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "expiryTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "refundInitiated",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct DomainExchange.Bid",
                  "name": "bid",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "buyerInstantAcceptEnabled",
                  "type": "bool"
                }
              ],
              "internalType": "struct DomainExchange.BidDetailsWithId[][]",
              "name": "bidInfo",
              "type": "tuple[][]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256[]",
              "name": "_listingIds",
              "type": "uint256[]"
            }
          ],
          "name": "getListings",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "listingId",
                  "type": "uint256"
                },
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "seller",
                      "type": "address"
                    },
                    {
                      "internalType": "address payable",
                      "name": "saleEthRecipient",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "dkimKeyHash",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes",
                      "name": "encryptionKey",
                      "type": "bytes"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "domainId",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "askPrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minBidPrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "isActive",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "bids",
                      "type": "uint256[]"
                    }
                  ],
                  "internalType": "struct DomainExchange.Listing",
                  "name": "listing",
                  "type": "tuple"
                }
              ],
              "internalType": "struct DomainExchange.ListingWithId[]",
              "name": "listingInfo",
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
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "getUserBids",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "bidId",
                  "type": "uint256"
                },
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "buyer",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "listingId",
                      "type": "uint256"
                    },
                    {
                      "internalType": "string",
                      "name": "encryptedBuyerId",
                      "type": "string"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "buyerIdHash",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "expiryTimestamp",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "price",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "refundInitiated",
                      "type": "bool"
                    }
                  ],
                  "internalType": "struct DomainExchange.Bid",
                  "name": "bid",
                  "type": "tuple"
                },
                {
                  "internalType": "bool",
                  "name": "buyerInstantAcceptEnabled",
                  "type": "bool"
                }
              ],
              "internalType": "struct DomainExchange.BidDetailsWithId[]",
              "name": "bidInfo",
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
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "getUserListings",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "uint256",
                  "name": "listingId",
                  "type": "uint256"
                },
                {
                  "components": [
                    {
                      "internalType": "address",
                      "name": "seller",
                      "type": "address"
                    },
                    {
                      "internalType": "address payable",
                      "name": "saleEthRecipient",
                      "type": "address"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "dkimKeyHash",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "bytes",
                      "name": "encryptionKey",
                      "type": "bytes"
                    },
                    {
                      "internalType": "bytes32",
                      "name": "domainId",
                      "type": "bytes32"
                    },
                    {
                      "internalType": "uint256",
                      "name": "createdAt",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "askPrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "uint256",
                      "name": "minBidPrice",
                      "type": "uint256"
                    },
                    {
                      "internalType": "bool",
                      "name": "isActive",
                      "type": "bool"
                    },
                    {
                      "internalType": "uint256[]",
                      "name": "bids",
                      "type": "uint256[]"
                    }
                  ],
                  "internalType": "struct DomainExchange.Listing",
                  "name": "listing",
                  "type": "tuple"
                }
              ],
              "internalType": "struct DomainExchange.ListingWithId[]",
              "name": "listingInfo",
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
              "name": "_bidId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_newPrice",
              "type": "uint256"
            }
          ],
          "name": "increaseBidPrice",
          "outputs": [],
          "stateMutability": "payable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract ITransferDomainProcessor",
              "name": "_transferDomainProcessor",
              "type": "address"
            },
            {
              "internalType": "contract IVerifiedDomainRegistry",
              "name": "_verifiedDomainRegistry",
              "type": "address"
            },
            {
              "internalType": "contract IKeyHashAdapterV2",
              "name": "_mailServerKeyHashAdapter",
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
              "internalType": "uint256",
              "name": "_bidId",
              "type": "uint256"
            }
          ],
          "name": "initiateRefund",
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
          "name": "instantAcceptEnabled",
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
            }
          ],
          "name": "isAllowed",
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
          "name": "isEnabled",
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
          "name": "listingCounter",
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
          "name": "listings",
          "outputs": [
            {
              "internalType": "address",
              "name": "seller",
              "type": "address"
            },
            {
              "internalType": "address payable",
              "name": "saleEthRecipient",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "dkimKeyHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes",
              "name": "encryptionKey",
              "type": "bytes"
            },
            {
              "internalType": "bytes32",
              "name": "domainId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "createdAt",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "askPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "minBidPrice",
              "type": "uint256"
            },
            {
              "internalType": "bool",
              "name": "isActive",
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
          "name": "pauseMarketplace",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "paused",
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
              "name": "_listingId",
              "type": "uint256"
            }
          ],
          "name": "registryRemoveListing",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address[]",
              "name": "_disallowedAddresses",
              "type": "address[]"
            }
          ],
          "name": "removeAddressesFromAllowlist",
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
          "name": "transferDomainProcessor",
          "outputs": [
            {
              "internalType": "contract ITransferDomainProcessor",
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
          "name": "unpauseMarketplace",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_newBidRefundPeriod",
              "type": "uint256"
            }
          ],
          "name": "updateBidRefundPeriod",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_newBidSettlementPeriod",
              "type": "uint256"
            }
          ],
          "name": "updateBidSettlementPeriod",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_newFee",
              "type": "uint256"
            }
          ],
          "name": "updateFee",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address payable",
              "name": "_newFeeRecipient",
              "type": "address"
            }
          ],
          "name": "updateFeeRecipient",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "uint256",
              "name": "_listingId",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "_newAskPrice",
              "type": "uint256"
            },
            {
              "internalType": "address payable",
              "name": "_saleEthRecipient",
              "type": "address"
            }
          ],
          "name": "updateListing",
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
          "name": "updateMailServerKeyHashAdapter",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract ITransferDomainProcessor",
              "name": "_transferDomainProcessor",
              "type": "address"
            }
          ],
          "name": "updateTransferDomainProcessor",
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
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "userBids",
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
          "name": "userListings",
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
          "name": "verifiedDomainRegistry",
          "outputs": [
            {
              "internalType": "contract IVerifiedDomainRegistry",
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
              "name": "_bidId",
              "type": "uint256"
            }
          ],
          "name": "withdrawBid",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "NamecheapManagedKeyHashAdapter": {
      "address": "0x6d00beaA1F921f22f10bAda079f2fb1bf0342e38",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "bytes32[]",
              "name": "_mailServerKeyHashes",
              "type": "bytes32[]"
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
              "internalType": "bytes32",
              "name": "mailserverKeyHash",
              "type": "bytes32"
            }
          ],
          "name": "MailServerKeyHashAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "mailserverKeyHash",
              "type": "bytes32"
            }
          ],
          "name": "MailServerKeyHashRemoved",
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
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_mailserverKeyHash",
              "type": "bytes32"
            }
          ],
          "name": "addMailServerKeyHash",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getMailServerKeyHashes",
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
              "internalType": "bytes32",
              "name": "",
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
          "inputs": [
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "mailServerKeyHashes",
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
              "name": "_mailserverKeyHash",
              "type": "bytes32"
            }
          ],
          "name": "removeMailServerKeyHash",
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
      ]
    },
    "NullifierRegistry": {
      "address": "0xcE4d0DE6589bF2b439d08dc9addD56428D76eC25",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "bytes32",
              "name": "nullifier",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "writer",
              "type": "address"
            }
          ],
          "name": "NullifierAdded",
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
              "name": "writer",
              "type": "address"
            }
          ],
          "name": "WriterAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "writer",
              "type": "address"
            }
          ],
          "name": "WriterRemoved",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_nullifier",
              "type": "bytes32"
            }
          ],
          "name": "addNullifier",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_newWriter",
              "type": "address"
            }
          ],
          "name": "addWritePermission",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getWriters",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
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
          "name": "isNullified",
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
            }
          ],
          "name": "isWriter",
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
              "internalType": "address",
              "name": "_removedWriter",
              "type": "address"
            }
          ],
          "name": "removeWritePermission",
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
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "writers",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    },
    "TransferDomainProcessor": {
      "address": "0x5d915599DEaf3A15b47c2625F1910599B9D5a1fd",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_exchange",
              "type": "address"
            },
            {
              "internalType": "contract INullifierRegistry",
              "name": "_nullifierRegistry",
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
          "name": "exchange",
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
                  "internalType": "uint256[10]",
                  "name": "signals",
                  "type": "uint256[10]"
                }
              ],
              "internalType": "struct ITransferDomainProcessor.TransferProof",
              "name": "_proof",
              "type": "tuple"
            }
          ],
          "name": "processProof",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "dkimKeyHash",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "hashedReceiverId",
              "type": "bytes32"
            },
            {
              "internalType": "string",
              "name": "domainName",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "bidId",
              "type": "uint256"
            }
          ],
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
      ]
    },
    "VerifiedDomainRegistry": {
      "address": "0x6206EB4c794c7fe58315f76ab088Ee3C17E0d9f5",
      "abi": [
        {
          "inputs": [],
          "stateMutability": "nonpayable",
          "type": "constructor"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "domainId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "exchange",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "uint256",
              "name": "listingId",
              "type": "uint256"
            }
          ],
          "name": "DomainListed",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "domainId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "exchange",
              "type": "address"
            }
          ],
          "name": "DomainListingRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "domainId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "oldOwner",
              "type": "address"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "newOwner",
              "type": "address"
            }
          ],
          "name": "DomainTransferred",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "bytes32",
              "name": "domainId",
              "type": "bytes32"
            },
            {
              "indexed": true,
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "indexed": false,
              "internalType": "string",
              "name": "domainName",
              "type": "string"
            },
            {
              "indexed": false,
              "internalType": "uint256",
              "name": "expiryTime",
              "type": "uint256"
            }
          ],
          "name": "DomainVerified",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "exchange",
              "type": "address"
            }
          ],
          "name": "ExchangeAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": true,
              "internalType": "address",
              "name": "exchange",
              "type": "address"
            }
          ],
          "name": "ExchangeRemoved",
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
              "indexed": true,
              "internalType": "contract IVerifyDomainProcessor",
              "name": "newVerifyDomainProcessor",
              "type": "address"
            }
          ],
          "name": "VerifyDomainProcessorUpdated",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_exchange",
              "type": "address"
            }
          ],
          "name": "addExchange",
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
          "name": "domains",
          "outputs": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "string",
              "name": "name",
              "type": "string"
            },
            {
              "internalType": "uint256",
              "name": "expiryTime",
              "type": "uint256"
            },
            {
              "internalType": "address",
              "name": "exchange",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "listingId",
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
          "name": "exchanges",
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
              "name": "_domainId",
              "type": "bytes32"
            }
          ],
          "name": "getDomain",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "domainId",
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
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "expiryTime",
                      "type": "uint256"
                    },
                    {
                      "internalType": "address",
                      "name": "exchange",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "listingId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct IVerifiedDomainRegistry.Domain",
                  "name": "domain",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IVerifiedDomainRegistry.DomainWithId",
              "name": "domainInfo",
              "type": "tuple"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_domainName",
              "type": "string"
            }
          ],
          "name": "getDomainId",
          "outputs": [
            {
              "internalType": "bytes32",
              "name": "",
              "type": "bytes32"
            }
          ],
          "stateMutability": "pure",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_domainId",
              "type": "bytes32"
            }
          ],
          "name": "getDomainOwner",
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
              "internalType": "bytes32[]",
              "name": "_domains",
              "type": "bytes32[]"
            }
          ],
          "name": "getDomains",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "domainId",
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
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "expiryTime",
                      "type": "uint256"
                    },
                    {
                      "internalType": "address",
                      "name": "exchange",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "listingId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct IVerifiedDomainRegistry.Domain",
                  "name": "domain",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IVerifiedDomainRegistry.DomainWithId[]",
              "name": "domainInfo",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getExchanges",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_user",
              "type": "address"
            }
          ],
          "name": "getUserDomains",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "bytes32",
                  "name": "domainId",
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
                      "internalType": "string",
                      "name": "name",
                      "type": "string"
                    },
                    {
                      "internalType": "uint256",
                      "name": "expiryTime",
                      "type": "uint256"
                    },
                    {
                      "internalType": "address",
                      "name": "exchange",
                      "type": "address"
                    },
                    {
                      "internalType": "uint256",
                      "name": "listingId",
                      "type": "uint256"
                    }
                  ],
                  "internalType": "struct IVerifiedDomainRegistry.Domain",
                  "name": "domain",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IVerifiedDomainRegistry.DomainWithId[]",
              "name": "domainInfo",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IVerifyDomainProcessor",
              "name": "_verifyDomainProcessor",
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
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "name": "isExchange",
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
              "name": "_domainId",
              "type": "bytes32"
            }
          ],
          "name": "removeDomainListing",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_exchange",
              "type": "address"
            }
          ],
          "name": "removeExchange",
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
              "internalType": "bytes32",
              "name": "_domainId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "_listingId",
              "type": "uint256"
            }
          ],
          "name": "setDomainListing",
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
          "inputs": [
            {
              "internalType": "bytes32",
              "name": "_domainId",
              "type": "bytes32"
            },
            {
              "internalType": "address",
              "name": "_newOwner",
              "type": "address"
            }
          ],
          "name": "updateDomainOnSale",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "contract IVerifyDomainProcessor",
              "name": "_verifyDomainProcessor",
              "type": "address"
            }
          ],
          "name": "updateVerifyDomainProcessor",
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
            },
            {
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "userDomains",
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
          "name": "verifyDomainProcessor",
          "outputs": [
            {
              "internalType": "contract IVerifyDomainProcessor",
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
                      "name": "provider",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "parameters",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "context",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Claims.ClaimInfo",
                  "name": "claimInfo",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "identifier",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "address",
                          "name": "owner",
                          "type": "address"
                        },
                        {
                          "internalType": "uint32",
                          "name": "timestampS",
                          "type": "uint32"
                        },
                        {
                          "internalType": "uint32",
                          "name": "epoch",
                          "type": "uint32"
                        }
                      ],
                      "internalType": "struct Claims.CompleteClaimData",
                      "name": "claim",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes[]",
                      "name": "signatures",
                      "type": "bytes[]"
                    }
                  ],
                  "internalType": "struct Claims.SignedClaim",
                  "name": "signedClaim",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IProxyBaseProcessor.Proof[]",
              "name": "_proofs",
              "type": "tuple[]"
            }
          ],
          "name": "verifyDomains",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        }
      ]
    },
    "VerifyDomainProcessor": {
      "address": "0x9eD28eBE190827fB8cfb2428C598f406d951Ac5e",
      "abi": [
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_registry",
              "type": "address"
            },
            {
              "internalType": "contract INullifierRegistry",
              "name": "_nullifierRegistry",
              "type": "address"
            },
            {
              "internalType": "string[]",
              "name": "_providerHashes",
              "type": "string[]"
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
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "providerHash",
              "type": "string"
            }
          ],
          "name": "ProviderHashAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "string",
              "name": "providerHash",
              "type": "string"
            }
          ],
          "name": "ProviderHashRemoved",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "witness",
              "type": "address"
            }
          ],
          "name": "WitnessAdded",
          "type": "event"
        },
        {
          "anonymous": false,
          "inputs": [
            {
              "indexed": false,
              "internalType": "address",
              "name": "witness",
              "type": "address"
            }
          ],
          "name": "WitnessRemoved",
          "type": "event"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "_newProviderHash",
              "type": "string"
            }
          ],
          "name": "addProviderHash",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_newWitness",
              "type": "address"
            }
          ],
          "name": "addWitness",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getProviderHashes",
          "outputs": [
            {
              "internalType": "string[]",
              "name": "",
              "type": "string[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [],
          "name": "getWitnesses",
          "outputs": [
            {
              "internalType": "address[]",
              "name": "",
              "type": "address[]"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "string",
              "name": "",
              "type": "string"
            }
          ],
          "name": "isProviderHash",
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
            }
          ],
          "name": "isWitness",
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
              "internalType": "uint256",
              "name": "",
              "type": "uint256"
            }
          ],
          "name": "providerHashes",
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
          "name": "registry",
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
              "internalType": "string",
              "name": "_removeProviderHash",
              "type": "string"
            }
          ],
          "name": "removeProviderHash",
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
        },
        {
          "inputs": [
            {
              "internalType": "address",
              "name": "_removeWitness",
              "type": "address"
            }
          ],
          "name": "removeWitness",
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
              "components": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "provider",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "parameters",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "context",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Claims.ClaimInfo",
                  "name": "claimInfo",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "identifier",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "address",
                          "name": "owner",
                          "type": "address"
                        },
                        {
                          "internalType": "uint32",
                          "name": "timestampS",
                          "type": "uint32"
                        },
                        {
                          "internalType": "uint32",
                          "name": "epoch",
                          "type": "uint32"
                        }
                      ],
                      "internalType": "struct Claims.CompleteClaimData",
                      "name": "claim",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes[]",
                      "name": "signatures",
                      "type": "bytes[]"
                    }
                  ],
                  "internalType": "struct Claims.SignedClaim",
                  "name": "signedClaim",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IProxyBaseProcessor.Proof",
              "name": "proof",
              "type": "tuple"
            }
          ],
          "name": "verifyProofSignatures",
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
              "components": [
                {
                  "components": [
                    {
                      "internalType": "string",
                      "name": "provider",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "parameters",
                      "type": "string"
                    },
                    {
                      "internalType": "string",
                      "name": "context",
                      "type": "string"
                    }
                  ],
                  "internalType": "struct Claims.ClaimInfo",
                  "name": "claimInfo",
                  "type": "tuple"
                },
                {
                  "components": [
                    {
                      "components": [
                        {
                          "internalType": "bytes32",
                          "name": "identifier",
                          "type": "bytes32"
                        },
                        {
                          "internalType": "address",
                          "name": "owner",
                          "type": "address"
                        },
                        {
                          "internalType": "uint32",
                          "name": "timestampS",
                          "type": "uint32"
                        },
                        {
                          "internalType": "uint32",
                          "name": "epoch",
                          "type": "uint32"
                        }
                      ],
                      "internalType": "struct Claims.CompleteClaimData",
                      "name": "claim",
                      "type": "tuple"
                    },
                    {
                      "internalType": "bytes[]",
                      "name": "signatures",
                      "type": "bytes[]"
                    }
                  ],
                  "internalType": "struct Claims.SignedClaim",
                  "name": "signedClaim",
                  "type": "tuple"
                }
              ],
              "internalType": "struct IProxyBaseProcessor.Proof[]",
              "name": "_proofs",
              "type": "tuple[]"
            }
          ],
          "name": "verifyProofs",
          "outputs": [
            {
              "components": [
                {
                  "internalType": "string",
                  "name": "name",
                  "type": "string"
                },
                {
                  "internalType": "uint256",
                  "name": "expiryTime",
                  "type": "uint256"
                }
              ],
              "internalType": "struct IVerifyDomainProcessor.DomainRaw[]",
              "name": "domains",
              "type": "tuple[]"
            }
          ],
          "stateMutability": "nonpayable",
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
          "name": "witnesses",
          "outputs": [
            {
              "internalType": "address",
              "name": "",
              "type": "address"
            }
          ],
          "stateMutability": "view",
          "type": "function"
        }
      ]
    }
  }
} as const;