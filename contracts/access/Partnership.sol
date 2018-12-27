pragma solidity ^0.4.24;

import "../tokenized/Tokenized.sol";
import "../math/SafeMath.sol";

/**
 * @title Provides partnership features between contracts.
 * @notice If msg.sender is the owner, in the Foundation sense
 * (see OwnableInFoundation), of another partnership contract that is
 * authorized in this partnership contract,
 * then he passes isPartnershipMember().
 * Obviously this function is meant to be used in modifiers
 * in contrats that inherit of this one and provide "restricted" content.
 * Partnerships are symetrical: when you request a partnership,
 * you automatically authorize the requested partnership contract.
 * Same thing when you remove a partnership.
 * This is done through symetrical functions,
 * where the user submits a tx on his own Partnership contract to ask partnership
 * to another and not on the other contract.
 * @author Talao, Polynomial.
 * @dev Convention here: _function = to be called by another partnership contract.
 */
contract Partnership is Tokenized {

    using SafeMath for uint;

    // Foundation contract.
    Foundation foundation;

    // Our category for partnerships.
    uint public partnerCategory;

    // Authorization status.
    enum PartnershipAuthorization { Unknown, Authorized, Pending, Rejected, Removed }

    // Other Partnership contract information.
    struct PartnershipContract {
        // Authorization of this contract.
        // bytes31 left after this on SSTORAGE 1.
        PartnershipAuthorization authorization;
        // Date of partnership creation.
        // Let's avoid the 2038 year bug, even if this contract will be dead
        // a lot sooner! It costs nothing, so...
        // bytes26 left after this on SSTORAGE 1.
        uint40 createdAt;
    }
    // Our main registry of Partnership contracts.
    mapping(address => PartnershipContract) internal partnershipContracts;

    // Index of known partnerships (contracts which interacted at least once).
    address[] internal knownPartnershipContracts;

    // Total of authorized Partnerships contracts.
    uint public partnershipsNumber;

    // Event when another Partnership contract has asked partnership.
    event PartnershipRequested();

    // Event when another Partnership contract has authorized our request.
    event PartnershipAccepted();

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, address _token, uint _partnerCategory)
        Tokenized(_foundation, _token)
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        partnerCategory = _partnerCategory;
    }

    /**
     * @dev This function will be used in inherited contracts,
     * @dev to restrict read access to members of Partnership contracts
     * @dev which are authorized in this contract.
     */
    function isPartnershipMember() public view returns (bool) {
        return partnershipContracts[foundation.membersToContracts(msg.sender)].authorization == PartnershipAuthorization.Authorized;
    }

    /**
     * @dev Modifier version of isPartnershipMember.
     * @dev Not used for now, but could be useful.
     */
    modifier onlyPartnershipMember() {
        require(
          isPartnershipMember(),
          'You are not member of a partnership'
        );
        _;
    }

    /**
     * @dev Get partnership status in this contract for a user.
     */
    function getMyPartnershipStatus()
        external
        view
        returns (uint authorization)
    {
        // If msg.sender has no Partnership contract, return Unknown (0).
        if (foundation.membersToContracts(msg.sender) == address(0)) {
            return uint(PartnershipAuthorization.Unknown);
        } else {
            return uint(partnershipContracts[foundation.membersToContracts(msg.sender)].authorization);
        }
    }

    /**
     * @dev Get the list of all known Partnership contracts.
     */
    function getKnownPartnershipsContracts()
        external
        view
        onlyHasKeyForPurpose(20003)
        returns (address[])
    {
        return knownPartnershipContracts;
    }

    /**
     * @dev Get a Partnership contract information.
     */
    function getPartnership(address _hisContract)
        external
        view
        onlyHasKeyForPurpose(20003)
        returns (address, uint, uint, uint40)
    {
          PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
          return (
              foundation.contractsToOwners(_hisContract),
              hisInterface.partnerCategory(),
              uint(partnershipContracts[_hisContract].authorization),
              partnershipContracts[_hisContract].createdAt
          );
    }

    /**
     * @dev Request partnership.
     * @dev The owner of this contract requests a partnership
     * @dev with another Partnership contract
     * @dev through THIS contract.
     */
    function requestPartnership(address _hisContract)
        external
        onlyHasKeyForPurpose(20003)
    {
        // We can only request partnership with a contract
        // if he's not already Known or Removed in our registry.
        // If he is, we symetrically are already in his partnerships.
        // Indeed when he asked a partnership with us,
        // he added us in authorized partnerships.
        require(
            (
                partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Unknown ||
                partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Removed
            )
            ,
            'Partnership contract must be Unknown or Removed'
        );
        // Request partnership in the other contract.
        // Open interface on his contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        bool success = hisInterface._requestPartnership();
        // If partnership request was a success,
        if (success) {
            // If we do not know the Partnership contract yet,
            if (partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Unknown) {
                // Then add it to our partnerships index.
                knownPartnershipContracts.push(_hisContract);
            }
            // Authorize Partnership contract in our contract.
            partnershipContracts[_hisContract].authorization = PartnershipAuthorization.Authorized;
            // Record date of partnership creation.
            partnershipContracts[_hisContract].createdAt = uint40(now);
            // Give the Partnership contrat's owner an ERC 725 "Claim" key.
            // So he can submit claims on our contract (certificate of work, ...).
            addKey(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3, 1);
            // Increment our number of partnerships.
            partnershipsNumber = partnershipsNumber.add(1);
        }
    }

    /**
     * @dev Symetry of requestPartnership.
     * @dev Called by Partnership contract wanting to partnership.
     */
    function _requestPartnership() external returns (bool success) {
        require(
            (
                partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Unknown ||
                partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Removed
            ),
            'Partnership already pending, authorized or rejected'
        );
        // If this Partnership contract is Unknown,
        if (partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Unknown) {
            // Add the new partnership to our partnerships index.
            knownPartnershipContracts.push(msg.sender);
        }
        // Write Pending to our partnerships contract registry.
        partnershipContracts[msg.sender].authorization = PartnershipAuthorization.Pending;
        // Event for this contrat owner's UI.
        emit PartnershipRequested();
        // Return success.
        success = true;
    }

    /**
     * @dev Authorize Partnership.
     */
    function authorizePartnership(address _hisContract)
        external
        onlyHasKeyForPurpose(20003)
    {
        require(
            partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Pending,
            'Partnership must be Pending'
        );
        // Authorize the Partnership contract in our contract.
        partnershipContracts[_hisContract].authorization = PartnershipAuthorization.Authorized;
        // Record the date of partnership creation.
        partnershipContracts[_hisContract].createdAt = uint40(now);
        // Give the Partnership contrat's owner an ERC 725 "Claim" key.
        // So he can submit claims on our contract (certificate of work, ...).
        addKey(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3, 1);
        // Increment our number of partnerships.
        partnershipsNumber = partnershipsNumber.add(1);
        // Log an event in the new authorized partner contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        hisInterface._authorizePartnership();
    }

    /**
     * @dev Allows other Partnership contract to send an event when authorizing.
     */
    function _authorizePartnership() external {
        require(
            partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Authorized,
            'You have no authorized partnership'
        );
        emit PartnershipAccepted();
    }

    /**
     * @dev Reject Partnership.
     */
    function rejectPartnership(address _hisContract)
        external
        onlyHasKeyForPurpose(20003)
    {
        require(
            partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Pending,
            'Partner must be Pending'
        );
        partnershipContracts[_hisContract].authorization = PartnershipAuthorization.Rejected;
    }

    /**
     * @dev Remove Partnership.
     */
    function removePartnership(address _hisContract)
        external
        onlyHasKeyForPurpose(20003)
    {
        require(
            (
                partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Authorized ||
                partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Rejected
            ),
            'Partnership must be Authorized or Rejected'
        );
        // Remove ourselves in the other Partnership contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        bool success = hisInterface._removePartnership();
        // If success,
        if (success) {
            // If it was an authorized partnership,
            if (partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Authorized) {
                // Remove the partnership creation date.
                delete partnershipContracts[_hisContract].createdAt;
                // Decrement our number of partnerships.
                partnershipsNumber = partnershipsNumber.sub(1);
            }
            // If there is one, remove ERC 725 "Claim" key for Partnership contract owner.
            if (keyHasPurpose(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3)) {
                removeKey(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3);
            }
            // Change his partnership to Removed in our contract.
            // We want to have Removed instead of resetting to Unknown,
            // otherwise if partnership is initiated again with him,
            // our knownPartnershipContracts would have a duplicate entry.
            partnershipContracts[_hisContract].authorization = PartnershipAuthorization.Removed;
        }
    }

    /**
     * @dev Symetry of removePartnership.
     * @dev Called by Partnership contract breaking partnership with us.
     */
    function _removePartnership() external returns (bool success) {
        // He wants to break partnership with us, so we break too.
        // If it was an authorized partnership,
        if (partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Authorized) {
            // Remove date of partnership creation.
            delete partnershipContracts[msg.sender].createdAt;
            // Decrement our number of partnerships.
            partnershipsNumber = partnershipsNumber.sub(1);
        }
        // If there is one, remove ERC 725 "Claim" key for Partnership contract owner.
        // TODO: unfortunately we can not automate this. Indeed it would require
        // the Partnership contract to have an ERC 725 Management key,
        // In order to remove a key.
        /* if (keyHasPurpose(keccak256(abi.encodePacked(foundation.contractsToOwners(msg.sender))), 3)) {
            removeKey(keccak256(abi.encodePacked(foundation.contractsToOwners(msg.sender))), 3);
        } */
        // Remove his authorization.
        partnershipContracts[msg.sender].authorization = PartnershipAuthorization.Removed;
        // We return to the calling contract that it's done.
        success = true;
    }
}


/**
 * @title Interface with clones or inherited contracts.
 */
interface PartnershipInterface {
  function _requestPartnership() external view returns (bool);
  function _authorizePartnership() external;
  function _removePartnership() external returns (bool success);
  function partnerCategory() external view returns (uint);
}
