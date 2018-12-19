pragma solidity ^0.4.24;

// TODO: add compteur de partenaires acceptés

import '../ownership/OwnableInFoundation.sol';

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
contract Partnership is OwnableInFoundation {

    // Foundation contract.
    Foundation foundation;

    // Our category for partnerships.
    uint public partnerCategory;

    // Authorization status.
    enum PartnershipAuthorization { Unknown, Authorized, Pending, Rejected, Removed }

    // Other Partnership contracts authorization status in this contract.
    // Our main registry if you will.
    mapping(address => PartnershipAuthorization) internal partnershipAuthorizations;

    // Index of known partnerships (contracts have interacted at least once).
    address[] internal knownPartnershipContracts;

    // Event when another Partnership contract has asked partnership.
    event PartnershipRequested();

    // Event when another Partnership contract has authorized our request.
    event PartnershipAccepted();

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, uint _partnerCategory)
        OwnableInFoundation(_foundation)
        public
    {
        foundation = Foundation(_foundation);
        partnerCategory = _partnerCategory;
    }

    /**
     * @dev This function will be used in inherited contracts,
     * @dev to restrict read access to members of Partnership contracts
     * @dev which are authorized in this contract.
     */
    function isPartnershipMember() public view returns (bool) {
        return partnershipAuthorizations[foundation.membersToContracts(msg.sender)] == PartnershipAuthorization.Authorized;
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
            return uint(partnershipAuthorizations[foundation.membersToContracts(msg.sender)]);
        }
    }

    /**
     * @dev Get the list of all known Partnership contracts.
     */
    function getKnownPartnershipsContracts()
        external
        view
        onlyOwnerInFoundation
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
        onlyOwnerInFoundation
        returns (address, uint, uint)
    {
          PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
          return (
              foundation.contractsToOwners(_hisContract),
              hisInterface.partnerCategory(),
              uint(partnershipAuthorizations[_hisContract])
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
        onlyOwnerInFoundation
    {
        // We can only request partnership with a contract
        // if he's not already Known or Removed in our registry.
        // If he is, we symetrically are already in his partnerships.
        // Indeed when he asked a partnership with us,
        // he added us in authorized partnerships.
        require(
            (
                partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Unknown ||
                partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Removed
            )
            ,
            'Partnership contract must be Unknown or Removed'
        );
        // Get his partner category and check we have not the same.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        uint hisCategory = hisInterface.partnerCategory();
        require(
            partnerCategory != hisCategory,
            'Contracts of same category can not partnership'
        );
        // Request partnership in the other contract.
        // Other contract can trust us on partnerCategory because all
        // contracts are registred in Foundation by factories.
        bool success = hisInterface._requestPartnership(partnerCategory);
        // If partnership request was a success,
        if (success) {
            // If we do not know the Partnership contract yet,
            if (partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Unknown) {
                // Then add it to our partnerships index.
                knownPartnershipContracts.push(_hisContract);
            }
            // Authorize Partnership contract in our contract.
            partnershipAuthorizations[_hisContract] = PartnershipAuthorization.Authorized;
        }
    }

    /**
     * @dev Symetry of requestPartnership.
     * @dev Called by Partnership contract wanting to partnership.
     */
    function _requestPartnership(uint _hisPartnerCategory)
        external
        returns (bool success)
    {
        require(
            (
                partnershipAuthorizations[msg.sender] == PartnershipAuthorization.Unknown ||
                partnershipAuthorizations[msg.sender] == PartnershipAuthorization.Removed
            ),
            'Partnership already pending, authorized or rejected'
        );
        require(
            partnerCategory != _hisPartnerCategory,
            'Contracts of same category can not partnership'
        );
        // If this Partnership contract is Unknown,
        if (partnershipAuthorizations[msg.sender] == PartnershipAuthorization.Unknown) {
            // Add the new partnership to our partnerships index.
            knownPartnershipContracts.push(msg.sender);
        }
        // Write Pending to our partnerships contract registry.
        partnershipAuthorizations[msg.sender] = PartnershipAuthorization.Pending;
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
        onlyOwnerInFoundation
    {
        require(
            partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Pending,
            'Partnership must be Pending'
        );
        // Authorize the Partnership contract in our contract.
        partnershipAuthorizations[_hisContract] = PartnershipAuthorization.Authorized;
        // Log an event in the new authorized partner contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        hisInterface._authorizePartnership();
    }

    /**
     * @dev Allows other Partnership contract to send an event when authorizing.
     */
    function _authorizePartnership() external {
        require(
            partnershipAuthorizations[msg.sender] == PartnershipAuthorization.Authorized,
            'You have no authorized partnership'
        );
        emit PartnershipAccepted();
    }

    /**
     * @dev Reject Partnership.
     */
    function rejectPartnership(address _hisContract)
        external
        onlyOwnerInFoundation
    {
        require(
            partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Pending,
            'Partner must be Pending'
        );
        partnershipAuthorizations[_hisContract] = PartnershipAuthorization.Rejected;
    }

    /**
     * @dev Remove Partnership.
     */
    function removePartnership(address _hisContract)
        external
        onlyOwnerInFoundation
    {
        require(
            (
                partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Authorized ||
                partnershipAuthorizations[_hisContract] == PartnershipAuthorization.Rejected
            ),
            'Partnership must be Authorized or Rejected'
        );
        // Remove ourselves in the other Partnership contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        bool success = hisInterface._removePartnership();
        // If success,
        if (success) {
            // Change his partnership to Removed in our contract.
            // We want to have Removed instead of resetting to Unknown,
            // otherwise if partnership is initiated again with him,
            // our knownPartnershipContracts would have a duplicate entry.
            partnershipAuthorizations[_hisContract] = PartnershipAuthorization.Removed;
        }
    }

    /**
     * @dev Symetry of removePartnership.
     * @dev Called by Partnership contract breaking partnership with us.
     */
    function _removePartnership() external returns (bool success) {
         // He wants to break partnership with us,
         // so we are breaking partnership with him,
         partnershipAuthorizations[msg.sender] = PartnershipAuthorization.Removed;
         // and telling him it's done.
         success = true;
    }
}


/**
 * @title Interface with clones or inherited contracts.
 */
interface PartnershipInterface {
  function _requestPartnership(uint _hisPartnerCategory)
      external
      view
      returns (bool);
  function _authorizePartnership() external;
  function _removePartnership() external returns (bool success);
  function partnerCategory() external view returns (uint);
}
