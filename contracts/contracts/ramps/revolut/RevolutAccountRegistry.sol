//SPDX-License-Identifier: MIT

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { Bytes32ArrayUtils } from "../../external/Bytes32ArrayUtils.sol";
import { Uint256ArrayUtils } from "../../external/Uint256ArrayUtils.sol";

import { IRevolutAccountRegistrationProcessor } from "./interfaces/IRevolutAccountRegistrationProcessor.sol";
import { IRevolutAccountRegistry } from "./interfaces/IRevolutAccountRegistry.sol";

pragma solidity ^0.8.18;

contract RevolutAccountRegistry is IRevolutAccountRegistry, Ownable {
    using Bytes32ArrayUtils for bytes32[];
    using Uint256ArrayUtils for uint256[];

    /* ============ Events ============ */
    event AccountRegistered(address indexed accountOwner, bytes32 indexed accountId);

    event UserAddedToDenylist(bytes32 listOwner, bytes32 deniedUser);
    event UserRemovedFromDenylist(bytes32 listOwner, bytes32 approvedUser);

    event AllowlistEnabled(bytes32 listOwner);
    event UserAddedToAllowlist(bytes32 indexed listOwner, bytes32 allowedUser);
    event UserRemovedFromAllowlist(bytes32 indexed listOwner, bytes32 allowedUser);

    event NewAccountRegistrationProcessorSet(address registrationProcessor);

    /* ============ Structs ============ */

    struct DenyList {
        bytes32[] deniedUsers;              // Array of accountIds that are denied from taking depositors liquidity
        mapping(bytes32 => bool) isDenied;  // Mapping of accountId to boolean indicating if the user is denied
    }

    struct AllowList {
        bool isEnabled;                     // Boolean indicating if the allowlist is enabled
        bytes32[] allowedUsers;             // Array of accountIds that are allowed from taking depositors liquidity
        mapping(bytes32 => bool) isAllowed; // Mapping of accountId to boolean indicating if the user is allowed
    }

    /* ============ Modifiers ============ */
    modifier onlyRegisteredUser() {
        require(isRegisteredUser(msg.sender), "Caller must be registered user");
        _;
    }

    /* ============ State Variables ============ */
    IRevolutAccountRegistrationProcessor public accountRegistrationProcessor;   // Address of Account registration processor contract

    bool public isInitialized;                                                  // Indicates if contract has been initialized

    mapping(address => bytes32) internal accounts;                              // Mapping of Ethereum accounts to hash of original Rev Tag
                                                                                // resulting hash is the accountId for our system
    mapping(bytes32 => DenyList) internal denyList;                             // Mapping of accountId to denylist
    mapping(bytes32 => AllowList) internal allowList;                           // Mapping of accountId to allow list

    /* ============ Constructor ============ */
    constructor(
        address _owner
    )
        Ownable()
    {
        transferOwnership(_owner);
    }

    /* ============ External Functions ============ */

    /**
     * @notice Initialize Ramp with the addresses of the Processors
     *
     * @param _accountRegistrationProcessor     Account Registration processor address
     */
    function initialize(
        IRevolutAccountRegistrationProcessor _accountRegistrationProcessor
    )
        external
        onlyOwner
    {
        require(!isInitialized, "Already initialized");

        accountRegistrationProcessor = _accountRegistrationProcessor;

        isInitialized = true;
    }

    /**
     * @notice Registers a new account by pulling the profileId from the proof and assigning the account owner to the
     * sender of the transaction.
     *
     * @param _proof    Registration proof consisting of unredacted data being notarized and a signature
     */
    function register(
        IRevolutAccountRegistrationProcessor.RegistrationProof calldata _proof
    )
        external
    {
        require(msg.sender == _proof.public_values.userAddress, "Caller must be address specified in proof");
        require(accounts[msg.sender] == bytes32(0), "Account already associated with accountId");
        bytes32 accountId = _verifyRegistrationProof(_proof);

        accounts[msg.sender] = accountId;

        emit AccountRegistered(msg.sender, accountId);
    }

    /**
     * @notice Adds an accountId to a depositor's deny list. If an address associated with the banned accountId attempts to
     * signal an intent on the user's deposit they will be denied.
     *
     * @param _deniedUser   accountId being banned
     */
    function addAccountToDenylist(bytes32 _deniedUser) external onlyRegisteredUser {
        bytes32 denyingUser = accounts[msg.sender];

        require(!denyList[denyingUser].isDenied[_deniedUser], "User already on denylist");

        denyList[denyingUser].isDenied[_deniedUser] = true;
        denyList[denyingUser].deniedUsers.push(_deniedUser);

        emit UserAddedToDenylist(denyingUser, _deniedUser);
    }

    /**
     * @notice Removes an accountId from a depositor's deny list.
     *
     * @param _approvedUser   accountId being approved
     */
    function removeAccountFromDenylist(bytes32 _approvedUser) external onlyRegisteredUser {
        bytes32 approvingUser = accounts[msg.sender];

        require(denyList[approvingUser].isDenied[_approvedUser], "User not on denylist");

        denyList[approvingUser].isDenied[_approvedUser] = false;
        denyList[approvingUser].deniedUsers.removeStorage(_approvedUser);

        emit UserRemovedFromDenylist(approvingUser, _approvedUser);
    }

    /**
     * @notice Enables allow list for user, only users on the allow list will be able to signal intents on the user's deposit.
     */
    function enableAllowlist() external onlyRegisteredUser {
        bytes32 allowingUser = accounts[msg.sender];

        require(!allowList[allowingUser].isEnabled, "Allow list already enabled");

        allowList[allowingUser].isEnabled = true;

        emit AllowlistEnabled(allowingUser);
    }

    /**
     * @notice Adds passed accountIds to a depositor's allow list. All addresses associated with the allowed accountIds will
     * be able to signal intents on the user's deposit.
     *
     * @param _allowedUsers   List of accountIds allowed to signal intents on the user's deposit
     */
    function addAccountsToAllowlist(bytes32[] memory _allowedUsers) external onlyRegisteredUser {
        bytes32 allowingUser = accounts[msg.sender];

        for(uint256 i = 0; i < _allowedUsers.length; i++) {
            bytes32 allowedUser = _allowedUsers[i];

            require(!allowList[allowingUser].isAllowed[allowedUser], "User already on allowlist");

            allowList[allowingUser].isAllowed[allowedUser] = true;
            allowList[allowingUser].allowedUsers.push(allowedUser);

            emit UserAddedToAllowlist(allowingUser, allowedUser);
        }
    }

    /**
     * @notice Removes an passed accountId's from allow list. If allow list is enabled only users on the allow list will be
     * able to signal intents on the user's deposit.
     *
     * @param _disallowedUsers   List of accountIds being approved
     */
    function removeAccountsFromAllowlist(bytes32[] memory _disallowedUsers) external onlyRegisteredUser {
        bytes32 disallowingUser = accounts[msg.sender];

        for(uint256 i = 0; i < _disallowedUsers.length; i++) {
            bytes32 disallowedUser = _disallowedUsers[i];

            require(allowList[disallowingUser].isAllowed[disallowedUser], "User not on allowlist");

            allowList[disallowingUser].isAllowed[disallowedUser] = false;
            allowList[disallowingUser].allowedUsers.removeStorage(disallowedUser);

            emit UserRemovedFromAllowlist(disallowingUser, disallowedUser);
        }
    }

    /* ============ Governance Functions ============ */

    /**
     * @notice GOVERNANCE ONLY: Updates the account registration processor address used for validating and interpreting tls proofs.
     *
     * @param _registrationProcessor   New registration proccesor address
     */
    function setAccountRegistrationProcessor(IRevolutAccountRegistrationProcessor _registrationProcessor) external onlyOwner {
        accountRegistrationProcessor = _registrationProcessor;
        emit NewAccountRegistrationProcessorSet(address(_registrationProcessor));
    }

    /* ============ External View Functions ============ */

    function getAccountId(address _account) public view returns (bytes32) {
        return accounts[_account];
    }

    function isRegisteredUser(address _account) public view returns (bool) {
        return getAccountId(_account) != bytes32(0);
    }

    function getDeniedUsers(address _account) external view returns (bytes32[] memory) {
        return denyList[getAccountId(_account)].deniedUsers;
    }

    function isDeniedUser(address _account, bytes32 _deniedUser) external view returns (bool) {
        return denyList[getAccountId(_account)].isDenied[_deniedUser];
    }

    function isAllowlistEnabled(address _account) external view returns (bool) {
        return allowList[getAccountId(_account)].isEnabled;
    }

    function getAllowedUsers(address _account) external view returns (bytes32[] memory) {
        return allowList[getAccountId(_account)].allowedUsers;
    }

    function isAllowedUser(address _account, bytes32 _allowedUser) external view returns (bool) {
        bytes32 allowingUser = getAccountId(_account);

        // Deny list overrides, if user on deny list then they are not allowed
        if(denyList[allowingUser].isDenied[_allowedUser]) { return false; }

        // Check if allow list is enabled, if so return status of user, else return true
        return allowList[allowingUser].isEnabled ? allowList[allowingUser].isAllowed[_allowedUser] : true;
    }
    
    /* ============ Internal Functions ============ */

    /**
     * @notice Validate the user has an Revolut account. We nullify this accountId along with the calling address so that
     * it can't be used again.
     */
    function _verifyRegistrationProof(
        IRevolutAccountRegistrationProcessor.RegistrationProof calldata _proof
    )
        internal
        returns (bytes32 accountId)
    {
        accountId = accountRegistrationProcessor.processProof(_proof);
    }
}
