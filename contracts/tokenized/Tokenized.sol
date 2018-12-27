pragma solidity ^0.4.24;

import "../ownership/OwnableInFoundation.sol";
import "../identity/ClaimHolder.sol";
import "../token/TalaoToken.sol";

/**
 * @title Adds Talao token and ERC 725/735 implementation to OwnableInFoundation.
 * @author Talao, Polynomial.
 */
contract Tokenized is OwnableInFoundation, ClaimHolder {

    // Foundation contract.
    Foundation foundation;

    // Talao token contract.
    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, address _token)
        OwnableInFoundation(_foundation)
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
    }

    /**
     * @dev Owner functions require open Vault in token.
     */
    function isActiveOwner() public view returns (bool) {
        return isOwnerInFoundation() && token.hasVaultAccess(msg.sender, msg.sender);
    }

    /**
     * @dev Modifier version of isActiveOwner.
     */
    modifier onlyActiveOwner() {
        require(isActiveOwner(), 'Access denied');
        _;
    }

    /**
     * @dev Does this contract owner have an open Vault in the token?
     */
    function hasOwnerOpenVault() public view returns (bool) {
        return token.hasVaultAccess(foundation.contractsToOwners(address(this)), foundation.contractsToOwners(address(this)));
    }

    /**
     * @dev Does msg.sender have an ERC 725 key with certain purpose,
     * and does the contract owner have an open Vault in the token?
     */
    function hasKeyForPurpose(uint256 _purpose) public view returns (bool) {
        return (
            (
                keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), 1) ||
                keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), _purpose)
            ) &&
            hasOwnerOpenVault()
        );
    }

    /**
     * @dev Modifier version of hasKeyForPurpose
     */
    modifier onlyHasKeyForPurpose(uint256 _purpose) {
        require(hasKeyForPurpose(_purpose), 'Access denied');
        _;
    }
}
