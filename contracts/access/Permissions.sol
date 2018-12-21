pragma solidity ^0.4.24;

import "./Partnership.sol";
import "../token/TalaoToken.sol";
import "../identity/ClaimHolder.sol";

/**
 * @title Permissions contract.
 * @author Talao, Polynomial.
 */
contract Permissions is Partnership, ClaimHolder {

    // Foundation contract.
    Foundation foundation;

    // Talao token contract.
    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, uint _partnerCategory, address _token)
        public Partnership(_foundation, _partnerCategory)
    {
        foundation = Foundation(_foundation);
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }

    /**
     * @dev Is msg.sender a "member" of this contract, in the Foundation sense?
     */
    function isMember() public view returns (bool) {
        return foundation.membersToContracts(msg.sender) == address(this);
    }

    /**
     * @dev Read authorization for inherited contracts "private" data.
     */
    function isReader() public view returns (bool) {
        // Get Vault access price in the token for this contract owner,
        // in the Foundation sense.
        (uint accessPrice,,,) = token.data(ownerInFoundation());
        // OR conditions for Reader:
        // 1) Same code for
        // 1.1) Sender is this contract owner and has an open Vault in the token.
        // 1.2) Sender has vaultAccess to this contract owner in the token.
        // 2) Owner has open Vault in the token and:
        // 2.1) Sender is a member of this contract,
        // 2.2) Sender is a member of an authorized Partner contract
        // 2.3) Owner has a free vaultAccess in the token
        return(
            token.hasVaultAccess(ownerInFoundation(), msg.sender) ||
            (
                token.hasVaultAccess(ownerInFoundation(), ownerInFoundation()) &&
                (
                    isMember() ||
                    isPartnershipMember() ||
                    accessPrice == 0
                )
            )
        );
    }

    /**
     * @dev Modifier version of isReader.
     */
    modifier onlyReader() {
        require(isReader(), 'Access denied');
        _;
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
     * @dev Does msg.sender have an ERC 725 key with certain purpose,
     * and does the contract owner an open Vault?
     */
    function hasKeyForPurpose(uint256 _purpose) public view returns (bool) {
        return (
            (
                keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), 1) ||
                keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), _purpose)
            ) &&
            token.hasVaultAccess(foundation.contractsToOwners(address(this)), foundation.contractsToOwners(address(this)))
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
