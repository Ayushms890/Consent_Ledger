// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AccessController
 * @dev Manages organization registration and role-based access.
 * Uses OpenZeppelin AccessControl for granular role management.
 *
 * Roles:
 *   - ADMIN_ROLE: Can register/remove organizations (contract deployer by default)
 *   - ORG_ROLE: Verified organizations that can receive consent and request access
 */
contract AccessController is AccessControl, Pausable {

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant ORG_ROLE = keccak256("ORG_ROLE");

    // Organization metadata (stored on-chain for transparency)
    struct Organization {
        bytes32 name;           // Hashed org name
        address wallet;         // Org wallet address
        bool verified;          // Currently verified or not
        uint48 registeredAt;    // When the org was registered
    }

    // Mapping from org address to Organization data
    mapping(address => Organization) public organizations;
    
    // Array of all registered org addresses (for enumeration)
    address[] public orgList;

    // Custom errors
    error OrgAlreadyRegistered();
    error OrgNotRegistered();
    error OrgNotVerified();

    // Events
    event OrganizationRegistered(address indexed org, bytes32 name, uint48 registeredAt);
    event OrganizationRemoved(address indexed org);
    event OrganizationVerificationChanged(address indexed org, bool verified);

    constructor() {
        // Deployer gets admin role
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @dev Register a new organization. Only callable by ADMIN_ROLE.
     */
    function registerOrganization(address _orgAddress, bytes32 _name) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (organizations[_orgAddress].wallet != address(0)) revert OrgAlreadyRegistered();

        organizations[_orgAddress] = Organization({
            name: _name,
            wallet: _orgAddress,
            verified: true,
            registeredAt: uint48(block.timestamp)
        });

        orgList.push(_orgAddress);
        _grantRole(ORG_ROLE, _orgAddress);

        emit OrganizationRegistered(_orgAddress, _name, uint48(block.timestamp));
    }

    /**
     * @dev Remove an organization's verification. Only callable by ADMIN_ROLE.
     */
    function removeOrganization(address _orgAddress) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (organizations[_orgAddress].wallet == address(0)) revert OrgNotRegistered();

        organizations[_orgAddress].verified = false;
        _revokeRole(ORG_ROLE, _orgAddress);

        emit OrganizationRemoved(_orgAddress);
    }

    /**
     * @dev Re-verify a previously removed organization. Only callable by ADMIN_ROLE.
     */
    function verifyOrganization(address _orgAddress) external onlyRole(ADMIN_ROLE) whenNotPaused {
        if (organizations[_orgAddress].wallet == address(0)) revert OrgNotRegistered();

        organizations[_orgAddress].verified = true;
        _grantRole(ORG_ROLE, _orgAddress);

        emit OrganizationVerificationChanged(_orgAddress, true);
    }

    /**
     * @dev Pause the contract in case of emergency. Only admin.
     */
    function pause() external onlyRole(ADMIN_ROLE) {
        _pause();
    }

    /**
     * @dev Unpause the contract. Only admin.
     */
    function unpause() external onlyRole(ADMIN_ROLE) {
        _unpause();
    }

    /**
     * @dev Check if an address is a verified organization.
     */
    function isVerifiedOrg(address _orgAddress) external view returns (bool) {
        return organizations[_orgAddress].verified;
    }

    /**
     * @dev Get total number of registered organizations.
     */
    function getOrgCount() external view returns (uint256) {
        return orgList.length;
    }
}
