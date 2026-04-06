// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "./AccessController.sol";

/**
 * @title ConsentManager
 * @dev Manages verifiable, purpose-bound user consent.
 * Phase 2: Integrates with AccessController for verified org enforcement.
 */
contract ConsentManager is Ownable, Pausable {

    uint256 public consentCount = 0;

    // Reference to the AccessController contract
    AccessController public accessController;

    // Custom errors for gas optimization (cheaper than require strings)
    error OnlyUserCanRevoke();
    error ConsentInactive();
    error AccessDenied();
    error OrgNotVerified();
    error InvalidExpiry();

    // Struct optimized to pack tightly
    struct Consent {
        address user;           // 20 bytes
        uint48 expiry;          // 6 bytes (safe for millions of years)
        bool active;            // 1 byte
                                // 5 bytes padding in Slot 1
        address organization;   // 20 bytes
                                // 12 bytes padding in Slot 2
        bytes32 dataCategory;   // 32 bytes (Slot 3)
        bytes32 purpose;        // 32 bytes (Slot 4)
    }

    mapping(uint256 => Consent) public consents;

    // Events for audit logs
    event ConsentGranted(
        address indexed user,
        address indexed org,
        uint256 indexed consentId,
        bytes32 dataCategory,
        bytes32 purpose,
        uint48 expiry
    );
    event ConsentRevoked(address indexed user, address indexed org, uint256 indexed consentId);
    event AccessRequested(address indexed org, uint256 indexed consentId, bytes32 requestedPurpose);
    event AccessApproved(address indexed org, uint256 indexed consentId);
    event AccessDeniedEvent(address indexed org, uint256 indexed consentId);

    constructor(address _accessController) Ownable(msg.sender) {
        accessController = AccessController(_accessController);
    }

    /**
     * @dev Pause the contract in case of emergency. Only owner.
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause the contract. Only owner.
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Grant a new consent. Organization must be verified.
     */
    function grantConsent(
        address _organization,
        bytes32 _dataCategory,
        bytes32 _purpose,
        uint48 _expiry
    ) external whenNotPaused {
        // Phase 2: Verify the organization is registered
        if (!accessController.isVerifiedOrg(_organization)) revert OrgNotVerified();
        
        // Expiry must be in the future
        if (_expiry <= uint48(block.timestamp)) revert InvalidExpiry();

        consentCount++;
        consents[consentCount] = Consent({
            user: msg.sender,
            expiry: _expiry,
            active: true,
            organization: _organization,
            dataCategory: _dataCategory,
            purpose: _purpose
        });

        emit ConsentGranted(
            msg.sender,
            _organization,
            consentCount,
            _dataCategory,
            _purpose,
            _expiry
        );
    }

    /**
     * @dev Batch grant multiple consents in a single transaction.
     * Gas optimized: reduces overhead for bulk operations.
     */
    function batchGrantConsents(
        address[] calldata _organizations,
        bytes32[] calldata _dataCategories,
        bytes32[] calldata _purposes,
        uint48[] calldata _expiries
    ) external whenNotPaused {
        uint256 len = _organizations.length;
        require(len == _dataCategories.length && len == _purposes.length && len == _expiries.length, "Array lengths mismatch");
        
        for (uint256 i = 0; i < len; i++) {
            // Phase 2: Verify the organization is registered
            if (!accessController.isVerifiedOrg(_organizations[i])) revert OrgNotVerified();
            
            // Expiry must be in the future
            if (_expiries[i] <= uint48(block.timestamp)) revert InvalidExpiry();

            consentCount++;
            consents[consentCount] = Consent({
                user: msg.sender,
                expiry: _expiries[i],
                active: true,
                organization: _organizations[i],
                dataCategory: _dataCategories[i],
                purpose: _purposes[i]
            });

            emit ConsentGranted(
                msg.sender,
                _organizations[i],
                consentCount,
                _dataCategories[i],
                _purposes[i],
                _expiries[i]
            );
        }
    }

    /**
     * @dev Revoke an active consent. Only callable by the user.
     */
    function revokeConsent(uint256 _consentId) external whenNotPaused {
        Consent storage c = consents[_consentId];
        
        if (c.user != msg.sender) revert OnlyUserCanRevoke();
        if (!c.active) revert ConsentInactive();
        
        c.active = false;
        
        emit ConsentRevoked(msg.sender, c.organization, _consentId);
    }

    /**
     * @dev Request access — returns true if approved, false if denied.
     * Does NOT revert on denial so AccessDeniedEvent is persisted on-chain.
     */
    function requestAccess(uint256 _consentId, bytes32 _requestedPurpose) external returns (bool) {
        Consent storage c = consents[_consentId];
        
        emit AccessRequested(msg.sender, _consentId, _requestedPurpose);

        // Core Validation Logic
        if(
            !c.active || 
            block.timestamp > c.expiry || 
            c.organization != msg.sender || 
            c.purpose != _requestedPurpose
        ) {
            emit AccessDeniedEvent(msg.sender, _consentId);
            return false;
        }

        emit AccessApproved(msg.sender, _consentId);
        return true;
    }

    /**
     * @dev Simple view function to verify active state (gas-free).
     */
    function verifyAccess(uint256 _consentId, bytes32 _requestedPurpose, address _org) external view returns (bool) {
        Consent memory c = consents[_consentId];
        if (
            !c.active || 
            block.timestamp > c.expiry || 
            c.organization != _org || 
            c.purpose != _requestedPurpose
        ) {
            return false;
        }
        return true;
    }

    /**
     * @dev Get consent details as a tuple (useful for frontend).
     */
    function getConsentDetails(uint256 _consentId) external view returns (
        address user,
        address organization,
        bytes32 dataCategory,
        bytes32 purpose,
        uint48 expiry,
        bool active,
        bool isExpired
    ) {
        Consent memory c = consents[_consentId];
        return (
            c.user,
            c.organization,
            c.dataCategory,
            c.purpose,
            c.expiry,
            c.active,
            block.timestamp > c.expiry
        );
    }
}
