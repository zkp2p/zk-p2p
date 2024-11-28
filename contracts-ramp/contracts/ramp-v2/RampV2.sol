// //SPDX-License-Identifier: MIT


// import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
// import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
// import { ECDSA } from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

// import { Bytes32ArrayUtils } from "../external/Bytes32ArrayUtils.sol";
// import { Uint256ArrayUtils } from "../external/Uint256ArrayUtils.sol";
// import { AddressArrayUtils } from "../external/AddressArrayUtils.sol";
// import { SignatureChecker } from "@openzeppelin/contracts/utils/cryptography/SignatureChecker.sol";

// import { IProcessorV2 } from "./interfaces/IProcessorV2.sol";
// import { IRampV2 } from "./interfaces/IRampV2.sol";

// pragma solidity ^0.8.18;

// contract RampV2 is Ownable, IRampV2 {

//     using Bytes32ArrayUtils for bytes32[];
//     using Uint256ArrayUtils for uint256[];
//     using AddressArrayUtils for address[];
    
//     using SignatureChecker for address;
//     using ECDSA for bytes32;

//     /* ============ Events ============ */
//     event DepositReceived(
//         uint256 indexed depositId,
//         address indexed depositor,
//         uint256 amount,
//         uint256 conversionRate,
//         bytes data
//     );

//     event IntentSignaled(
//         bytes32 indexed intentHash,
//         uint256 indexed depositId,
//         address indexed processor,
//         address gatingService,
//         address to,
//         uint256 amount,
//         uint256 timestamp
//     );

//     event IntentPruned(
//         bytes32 indexed intentHash,
//         uint256 indexed depositId
//     );

//     event IntentFulfilled(
//         bytes32 indexed intentHash,
//         uint256 indexed depositId,
//         address indexed onRamper,
//         address to,
//         uint256 amount,
//         uint256 feeAmount
//     );

//     event DepositWithdrawn(
//         uint256 indexed depositId,
//         address indexed onRamper,
//         uint256 amount
//     );

//     event DepositClosed(uint256 depositId, address depositor);
//     event MinDepositAmountSet(uint256 minDepositAmount);
//     event MaxOnRampAmountSet(uint256 maxOnRampAmount);
//     event IntentExpirationPeriodSet(uint256 intentExpirationPeriod);
//     event OnRampCooldownPeriodSet(uint256 onRampCooldownPeriod);
//     event SustainabilityFeeUpdated(uint256 fee);
//     event SustainabilityFeeRecipientUpdated(address feeRecipient);

//     /* ============ Structs ============ */

//     /* ============ Constants ============ */
//     uint256 internal constant PRECISE_UNIT = 1e18;
//     uint256 constant CIRCOM_PRIME_FIELD = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
//     uint256 constant MAX_SUSTAINABILITY_FEE = 5e16;   // 5% max sustainability fee
    
//     /* ============ State Variables ============ */

//     mapping(address => uint256[]) public accountDeposits;
//     mapping(address => bytes32[]) public accountIntents;

//     mapping(uint256 => Deposit) public deposits;                    // Mapping of depositIds to deposit structs
//     mapping(bytes32 => Intent) public intents;                      // Mapping of intentHashes to intent structs

//     // Governance controlled
//     mapping(address => bool) public whitelistedgatingServices;    // Mapping of matching service addresses to boolean indicating if they are whitelisted
//     mapping(address => bool) public whitelistedProcessors;          // Mapping of processor addresses to boolean indicating if they are whitelisted
//     mapping(address => uint256) public processorFeeShare;           // Mapping of processor addresses to their fee share

//     uint256 public minDepositAmount;                                // Minimum amount of USDC that can be deposited
//     uint256 public sustainabilityFee;                               // Fee charged to on-rampers in preciseUnits (1e16 = 1%)
//     address public sustainabilityFeeRecipient;                      // Address that receives the sustainability fee

//     uint256 public depositCounter;                                  // Counter for depositIds


//     /* ============ Constructor ============ */
//     constructor(
//         address _owner,
//         uint256 _minDepositAmount,
//         uint256 _sustainabilityFee,
//         address _sustainabilityFeeRecipient
//     )
//         Ownable()
//     {
//         minDepositAmount = _minDepositAmount;
//         sustainabilityFee = _sustainabilityFee;
//         sustainabilityFeeRecipient = _sustainabilityFeeRecipient;

//         transferOwnership(_owner);
//     }

//     /* ============ External Functions ============ */

        
//     function createDeposit(
//         IERC20 _token,
//         uint256 _amount,
//         uint256 _conversionRate,
//         address[] calldata _gatingServices,
//         bool _acceptWhitelistedgatingServices,
//         address[] calldata _processors,
//         address[] calldata _witness,
//         bytes calldata _data
//     )
//         external
//     {
//         _validateCreateDeposit(_amount, _gatingServices, _processors, _witness);

//         uint256 depositId = depositCounter++;

//         accountDeposits[msg.sender].push(depositId);

//         // deposits[depositId] = Deposit({
//         //     depositId: depositId,
//         //     depositor: msg.sender,
//         //     token: _token,
//         //     balances: DepositBalances({
//         //         amount: _amount,
//         //         remainingDeposits: _amount,
//         //         outstandingIntentAmount: 0
//         //     }),
//         //     gatingServices: _gatingServices,
//         //     acceptWhitelistedgatingServices: _acceptWhitelistedgatingServices,
//         //     processors: _processors,
//         //     witness: _witness,
//         //     data: _data,
//         //     conversionRate: _conversionRate,
//         //     intentHashes: new bytes32[](0)
//         // });

//         _token.transferFrom(msg.sender, address(this), _amount);

//         emit DepositReceived(depositId, msg.sender, _amount, _conversionRate, _data);
//     }


//     function signalIntent(
//         uint256 _depositId,
//         uint256 _amount,
//         address _to,
//         address _processor,
//         address _gatingService,
//         bytes calldata _gatingServiceSignature
//     )
//         external
//     {
//         Deposit storage deposit = deposits[_depositId];

//         // Verify intent is authentic
//         _validateIntentAuthenticity(
//             deposit, _amount, _to, _processor, _gatingService, _gatingServiceSignature
//         );
        
//         // Verify intent is valid
//         _validateIntent(deposit, _amount, _to, _processor);

//         // Unique intent hash for each (onRamper, processor, depositId)
//         bytes32 intentHash = _calculateIntentHash(msg.sender, _processor, _depositId);

//         if (deposit.balances.remainingDeposits < _amount) {
//             (
//                 bytes32[] memory prunableIntents,
//                 uint256 reclaimableAmount
//             ) = _getPrunableIntents(_depositId);

//             require(deposit.balances.remainingDeposits + reclaimableAmount >= _amount, "Not enough liquidity");

//             _pruneIntents(deposit, prunableIntents);
//             deposit.balances.remainingDeposits += reclaimableAmount;
//             deposit.balances.outstandingIntentAmount -= reclaimableAmount;
//         }

//         intents[intentHash] = Intent({
//             onRamper: msg.sender,
//             gatingService: _gatingService,
//             processor: _processor,
//             to: _to,
//             deposit: _depositId,
//             amount: _amount,
//             timestamp: block.timestamp
//         });

//         accountIntents[msg.sender].push(intentHash);

//         emit IntentSignaled(
//             intentHash, _depositId, _processor, _gatingService, _to, _amount, block.timestamp
//         );
//     }

//     function onRamp(
//         bytes calldata _proof,
//         address _processor
//     )
//         external
//     {
//         bytes32 intentHash = IProcessorV2(_processor).extractIntentHash(_proof);
        
//         Intent memory intent = intents[intentHash];
//         Deposit storage deposit = deposits[intent.deposit];

//         // todo: determine if a malicious processor can cheat here? And maybe that's why
//         // we need a whitelisted set of processors.
//         require(intent.processor == _processor, "Invalid processor");
//         // No checks for confirming caller is onRamper (allows sponsoring gas for on-ramp)

//         require(IProcessorV2(_processor).verifyPayment(_proof, intent, deposit), "Invalid payment");

//         _pruneIntent(deposit, intentHash);

//         // todo: Is the intent deleted here or is a copy stored in memory?
//         deposit.balances.outstandingIntentAmount -= intent.amount;
//         // No updating of last onramp timestamp
//         _closeDepositIfNecessary(intent.deposit, deposit);

//         // todo: Is the deposit deleted here or is a copy stored in memory? Defintiely deleted, so do something!
//         _transferFunds(deposit.token, intentHash, intent, _processor);
//     }

//     /* ============ Governance Functions ============ */

//     /* ============ External View Functions ============ */

//     /* ============ Internal Functions ============ */

//     function _validateCreateDeposit(
//         uint256 _amount,
//         address[] calldata _gatingServices,
//         address[] calldata _processors,
//         address[] calldata _witness
//     ) internal view {
//         require(_amount >= minDepositAmount, "Deposit amount must be greater than min deposit amount");
        
//         require(_gatingServices.length > 0, "At least one matching service is required");
//         require(_processors.length > 0, "At least one processor is required");
//         // todo: any meaningful check on conversion rate?
//         // require(_witness.length > 0, "At least one witness is required");
//     }

//     function _validateIntent(Deposit memory _deposit, uint256 _amount, address _to, address _processor) internal view {
//         require(_deposit.depositor != address(0), "Deposit does not exist");
//         require(_amount > 0, "Signaled amount must be greater than 0");
//         require(_to != address(0), "Cannot send to zero address");
//         // TODO: make this gas efficient by using a mapping
//         require(_deposit.processors.contains(_processor), "Processor not authorized");
//         require(_amount <= IProcessorV2(_processor).maxOnRampAmount(), "Signaled amount must be less than max on-ramp amount");

//         // No checks on lastOnRampTimestamp or currentIntentHash
//     }

//     function _validateIntentAuthenticity(
//         Deposit memory _deposit,
//         uint256 _amount,
//         address _to,
//         address _processor,
//         address _gatingService,
//         bytes calldata _gatingServiceSignature
//     ) internal view {
//         require(
//             _isValidSignature(
//                 abi.encodePacked(_deposit.depositId, _amount, _to, _processor),
//                 _gatingServiceSignature,
//                 _gatingService
//             ),
//             "Invalid matching service signature"
//         );
        
//         bool isValidgatingService = false;
//         if (_deposit.acceptWhitelistedgatingServices) {
//             isValidgatingService = whitelistedgatingServices[_gatingService];
//         }

//         if (!isValidgatingService) {
//             for (uint256 i = 0; i < _deposit.gatingServices.length; i++) {
//                 if (_deposit.gatingServices[i] == _gatingService) {
//                     isValidgatingService = true;
//                     break;
//                 }
//             }
//         }

//         require(isValidgatingService, "Signature not from valid matching service for deposit");
//     }


//     /**
//      * @notice Calculates the intentHash of new intent
//      */
//     function _calculateIntentHash(
//         address _onRamper,
//         address _processor,
//         uint256 _depositId
//     )
//         internal
//         view
//         virtual
//         returns (bytes32 intentHash)
//     {
//         // Mod with circom prime field to make sure it fits in a 254-bit field
//         uint256 intermediateHash = uint256(keccak256(abi.encodePacked(_onRamper, _processor, _depositId, block.timestamp)));
//         intentHash = bytes32(intermediateHash % CIRCOM_PRIME_FIELD);
//     }

//     /**
//      * @notice Cycles through all intents currently open on a deposit and sees if any have expired. If they have expired
//      * the outstanding amounts are summed and returned alongside the intentHashes
//      */
//     function _getPrunableIntents(
//         uint256 _depositId
//     )
//         internal
//         view
//         returns(bytes32[] memory prunableIntents, uint256 reclaimedAmount)
//     {
//         bytes32[] memory intentHashes = deposits[_depositId].intentHashes;
//         prunableIntents = new bytes32[](intentHashes.length);

//         for (uint256 i = 0; i < intentHashes.length; ++i) {
//             Intent memory intent = intents[intentHashes[i]];
//             uint256 intentExpirationPeriod = IProcessorV2(intent.processor).intentExpirationPeriod();
//             if (intent.timestamp + intentExpirationPeriod < block.timestamp) {
//                 prunableIntents[i] = intentHashes[i];
//                 reclaimedAmount += intent.amount;
//             }
//         }
//     }

//     function _pruneIntents(Deposit storage _deposit, bytes32[] memory _intents) internal {
//         for (uint256 i = 0; i < _intents.length; ++i) {
//             if (_intents[i] != bytes32(0)) {
//                 _pruneIntent(_deposit, _intents[i]);
//             }
//         }
//     }

//     /**
//      * @notice Pruning an intent involves deleting its state from the intents mapping, zeroing out the intendee's currentIntentHash in
//      * their global account mapping, and deleting the intentHash from the deposit's intentHashes array.
//      */
//     function _pruneIntent(Deposit storage _deposit, bytes32 _intentHash) internal {
//         Intent memory intent = intents[_intentHash];

//         accountIntents[intent.onRamper].removeStorage(_intentHash);
//         delete intents[_intentHash];
//         _deposit.intentHashes.removeStorage(_intentHash);

//         emit IntentPruned(_intentHash, intent.deposit);
//     }

//     /**
//      * @notice Removes a deposit if no outstanding intents AND no remaining deposits. Deleting a deposit deletes it from the
//      * deposits mapping and removes tracking it in the user's accounts mapping.
//      */
//     function _closeDepositIfNecessary(uint256 _depositId, Deposit storage _deposit) internal {
//         uint256 openDepositAmount = _deposit.balances.outstandingIntentAmount + _deposit.balances.remainingDeposits;
//         if (openDepositAmount == 0) {
//             accountDeposits[_deposit.depositor].removeStorage(_depositId);
//             emit DepositClosed(_depositId, _deposit.depositor);
//             delete deposits[_depositId];
//         }
//     }

//     /**
//      * @notice Checks if sustainability fee has been defined, if so sends fee to the fee recipient and intent amount minus fee
//      * to the on-ramper. If sustainability fee is undefined then full intent amount is transferred to on-ramper.
//      */
//     function _transferFunds(IERC20 _token, bytes32 _intentHash, Intent memory _intent, address _processor) internal {
//         uint256 fee;
//         uint256 processorFee;
//         if (sustainabilityFee != 0) {
//             fee = (_intent.amount * sustainabilityFee) / PRECISE_UNIT;
//             processorFee = (fee * processorFeeShare[_processor]) / PRECISE_UNIT;
//             _token.transfer(sustainabilityFeeRecipient, fee - processorFee);
//             _token.transfer(_processor, processorFee);
//         }

//         uint256 onRampAmount = _intent.amount - fee;
//         _token.transfer(_intent.to, onRampAmount);

//         emit IntentFulfilled(_intentHash, _intent.deposit, _intent.onRamper, _intent.to, onRampAmount, fee);
//     }

//     function _isValidSignature(
//         bytes memory _message,
//         bytes memory _signature,
//         address _signer
//     )
//         internal
//         view
//         returns(bool)
//     {
//         bytes32 verifierPayload = keccak256(_message).toEthSignedMessageHash();

//         return _signer.isValidSignatureNow(verifierPayload, _signature);
//     }
// }

