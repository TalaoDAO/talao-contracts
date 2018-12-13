pragma solidity ^0.4.24;

import './ownership/Ownable.sol';

/**
 * @title Partnership contract.
 * @notice This contract provides partnership features.
 * @author Talao, Polynomial.
 * @dev Convention here: _function = to be called by another partnership contract.
 */
contract Partnership is Ownable {

    // This contract category for partnerships.
    uint public partnerCategory;

    /**
     * @dev Registry of Partnership contracts.
     */

    // Authorization status.
    enum PartnershipAuthorization { Unknown, Authorized, Pending, Rejected }

    // Information about one know Partnership contract.
    struct PartnershipInformation {
        // Partnership contract category.
        // bytes31 left on SSTORAGE 1 after this.
        uint8 category;

        // Authorization of this Partnership contract.
        // Takes same place as an uint8.
        // bytes30 left on SSTORAGE 1 after this.
        PartnershipAuthorization authorization;

        // Last known owner of this Partnership contract.
        // bytes10 left on SSTORAGE 1 after this.
        address owner;
    }

    // Partnership contracts information mapping.
    mapping(address => PartnershipInformation) internal partnershipsRegistry;

    // Index of Partnership contracts.
    address[] internal partnershipsIndex;

    /**
     * @dev Owners of Partnership contracts.
     * @dev We want to authorize the owners of the Partnership contracts
     * @dev with which a partnership is established.
     */
    mapping(address => bool) internal authorizedPartnershipsOwners;

    // Event when another Partnership contract has asked partnership.
    event PartnershipRequested();

    // Event when another Partnership contract has authorized our asked partnership.
    event PartnershipAccepted();

    /**
     * @dev Constructor.
     */
    constructor(uint8 _partnerCategory) public {
        partnerCategory = _partnerCategory;
    }

    /**
     * @dev This function will be used in inherited contracts,
     * @dev to restrict read access to owners of Partnership contracts
     * @dev which have an established partnership with this contract.
     */
    function isAuthorizedPartnershipOwner() public view returns (bool) {
        return authorizedPartnershipsOwners[msg.sender];
    }

    /**
     * @dev Get partnership status in another Partnership contract.
     * @dev Works in pair with _getPartnershipAuthorization.
     */
    function getPartnershipAuthorization(address _address)
        external view onlyOwner returns (uint authorization)
    {
        // Interface with the contract we want to check.
        PartnershipInterface partnershipInterface = PartnershipInterface(_address);

        // Read interface and return authorization status.
        authorization = partnershipInterface._getPartnershipAuthorization();
    }

    /**
     * @dev Works in pair with getPartnershipAuthorization.
     */
    function _getPartnershipAuthorization() external view returns (uint) {
        return uint(partnershipsRegistry[msg.sender].authorization);
    }

    /**
     * @dev Get the list of Partnership contracts.
     */
    function getPartnerships() external view onlyOwner returns (address[]) {
        return partnershipsIndex;
    }

    /**
     * @dev Get a Partnership.
     */
    function getPartnership(address _address)
        external
        view
        onlyOwner
        returns (uint8, uint, address)
    {
          PartnershipInformation memory partnershipMemory = partnershipsRegistry[_address];

          return (
              partnershipMemory.category,
              uint(partnershipMemory.authorization),
              partnershipMemory.owner
          );
    }

    /**
     * @dev Request partnership.
     */
    function requestPartnership(address _address) external onlyOwner {

        // Storage pointer on new Partnership.
        PartnershipInformation storage partnershipStorage = partnershipsRegistry[_address];

        // We can only request a partnership if he's not already known.
        // If he is, then we symetrically are already in his partnerships.
        // Indeed when he asked a partnership with us,
        // he added us in authorized partnerships.
        require(
            partnershipStorage.authorization == PartnershipAuthorization.Unknown,
            'Partnership contract must be unknown'
        );

        // Interface with the contract for which we want to request partnership
        PartnershipInterface partnershipInterface = PartnershipInterface(_address);

        // Read information from it.
        uint partnershipInterfaceCategory = partnershipInterface.partnerCategory();
        address partnershipInterfaceOwner = partnershipInterface.owner();

        require(
            partnershipInterfaceCategory != partnerCategory,
            'Contracts of same category can not partnership'
        );

        // Request partnership in the other contract.
        bool success = partnershipInterface._requestPartnership();

        // If partnership request was a success,
        if (success) {
            // Write in our registry.
            partnershipStorage.category = uint8(partnershipInterfaceCategory);
            partnershipStorage.authorization = PartnershipAuthorization.Authorized;
            partnershipStorage.owner = partnershipInterfaceOwner;

            // Update our partners index.
            partnershipsIndex.push(_address);

            // Authorize the contract owner.
            authorizedPartnershipsOwners[partnershipInterfaceOwner] = true;
        }
    }

    /**
     * @dev Symetry of requestPartnership.
     */
    function _requestPartnership() external returns (bool success) {

        PartnershipInformation storage partnershipStorage = partnershipsRegistry[msg.sender];

        require(
            partnershipStorage.authorization == PartnershipAuthorization.Unknown,
            'Partnership already initiated'
        );

        // Interface with the contract that requests partnership.
        PartnershipInterface partnershipInterface = PartnershipInterface(msg.sender);

        // Read information from it.
        uint partnershipInterfaceCategory = partnershipInterface.partnerCategory();

        require(
            partnershipInterfaceCategory != partnerCategory,
            'Contracts of same category can not partnership'
        );

        // Write to our partners registry.
        partnershipStorage.category = uint8(partnershipInterfaceCategory);
        partnershipStorage.authorization = PartnershipAuthorization.Pending;

        // Add the new partnership to our partnerships index.
        partnershipsIndex.push(msg.sender);

        emit PartnershipRequested();

        // Return success.
        success = true;
    }

    /**
     * @dev Authorize Partnership.
     */
    function authorizePartnership(address _address) external onlyOwner {

        PartnershipInformation storage partnershipStorage = partnershipsRegistry[_address];

        require(
            partnershipStorage.authorization == PartnershipAuthorization.Pending,
            'Partnership must be Pending'
        );

        // Interface with the contract we will authorize.
        PartnershipInterface partnershipInterface = PartnershipInterface(_address);

        // Read information from it.
        address partnershipInterfaceOwner = partnershipInterface.owner();

        // Write to our partners registry.
        partnershipStorage.authorization = PartnershipAuthorization.Authorized;
        partnershipStorage.owner = partnershipInterfaceOwner;

        // Authorize the contract owner.
        authorizedPartnershipsOwners[partnershipInterfaceOwner] = true;

        // Log an event in the new authorized partner contract.
        partnershipInterface._notifyPartnershipAccepted();
    }

    /**
     * @dev Function for a Partnership contract to send an event, when authorizing.
     */
    function _notifyPartnershipAccepted() external {

        require(
            partnershipsRegistry[msg.sender].authorization == PartnershipAuthorization.Authorized,
            'Only authorized partner can notify authorization'
        );

        emit PartnershipAccepted();

    }

    /**
     * @dev Reject Partnership.
     */
    function rejectPartnership(address _address) external onlyOwner {

        PartnershipInformation storage partnershipStorage = partnershipsRegistry[_address];

        require(
            partnershipStorage.authorization == PartnershipAuthorization.Pending,
            'Partner must be Pending'
        );

        partnershipStorage.authorization = PartnershipAuthorization.Rejected;
    }

    /**
     * @dev Remove Partnership.
     */
    function removePartnership(address _address) external onlyOwner {

        PartnershipInformation storage partnershipStorage = partnershipsRegistry[_address];

        require(
            (
                partnershipStorage.authorization == PartnershipAuthorization.Authorized ||
                partnershipStorage.authorization == PartnershipAuthorization.Rejected
            ),
            'Partnership must be Authorized or Rejected'
        );

        // Remove ourselves in the other partnership contract.
        PartnershipInterface partnershipInterface = PartnershipInterface(_address);
        bool success = partnershipInterface._removePartnership();

        // Remove the partner.
        if (success) {
            // Remove in registry.
            partnershipStorage.authorization = PartnershipAuthorization.Unknown;

            // Not necessary to update category & owner in registry.

            // Unauthorize owner.
            address partnershipInterfaceOwner = partnershipInterface.owner();
            authorizedPartnershipsOwners[partnershipInterfaceOwner] = false;
        }
    }

    /**
     * @dev Symetry of removePartnership.
     */
    function _removePartnership() external returns (bool success) {

         PartnershipInformation storage partnershipStorage = partnershipsRegistry[msg.sender];
         PartnershipInterface partnershipInterface = PartnershipInterface(msg.sender);

         address partnershipInterfaceOwner = partnershipInterface.owner();

         // Remove other partnership contract from registry.
         partnershipStorage.authorization = PartnershipAuthorization.Unknown;

         // Unauthorize owner.
         authorizedPartnershipsOwners[partnershipInterfaceOwner] = false;

         success = true;
    }

    /**
     * @dev Update partnerships owners.
     * @dev To call if this contract changes ownership.
     */
    function updatePartnershipsOwner() external onlyOwner {
        PartnershipInterface partnershipInterface;
        // Loop through our known partners.
        for (uint i = 0; i < partnershipsIndex.length; i++) {
            // If the partnership is authorized,
            if (partnershipsRegistry[partnershipsIndex[i]].authorization == PartnershipAuthorization.Authorized) {
              // For each authorized, get the interface.
              partnershipInterface = PartnershipInterface(partnershipsIndex[i]);
              // Then update us in the partner contract.
              partnershipInterface._updatePartnershipsOwner();
            }
        }
    }

    /**
     * @dev Symetry of updatePartnershipsOwner.
     */
    function _updatePartnershipsOwner() external {
        // Storage pointer & init interface.
        PartnershipInformation storage partnershipStorage = partnershipsRegistry[msg.sender];
        PartnershipInterface partnershipInterface = PartnershipInterface(msg.sender);

        // Unauthorize previous known owner.
        authorizedPartnershipsOwners[partnershipStorage.owner] = false;

        // Get current owner.
        address partnershipInterfaceOwner = partnershipInterface.owner();

        // Update owner in registry.
        partnershipStorage.owner = partnershipInterfaceOwner;

        // If partnership is active,
        if (partnershipsRegistry[msg.sender].authorization == PartnershipAuthorization.Authorized) {
            // Authorize current owner.
            authorizedPartnershipsOwners[partnershipInterfaceOwner] = true;
        }
    }
}


/**
 * @title Interface with clones or inherited contracts.
 */
interface PartnershipInterface {
  function _getPartnershipAuthorization() external view returns (uint8);
  function _requestPartnership() external view returns (bool);
  function _notifyPartnershipAccepted() external;
  function _removePartnership() external returns (bool success);
  function _updatePartnershipsOwner() external;
  function partnerCategory() external view returns (uint);
  function owner() external view returns (address);
}
