pragma solidity ^0.4.24;

import './ownership/Ownable.sol';

/**
 * @title Partner contract.
 * @notice This contract provides Partner features.
 * @author Talao, Polynomial.
 * @dev Convention here: _function = to be called by another partner contract.
 */
contract Partner is Ownable {

    // This contract Partner category.
    uint public partnerCategory;

    /**
     * @dev Registry of Partner contracts.
     */

    // Authorization status.
    enum PartnerAuthorization { Unknown, Authorized, Pending, Rejected }

    // Information about one know Partner contract.
    struct PartnerInformation {
        // Partner contract category.
        // bytes31 left on SSTORAGE 1 after this.
        uint8 category;

        // Authorization of this Partner contract.
        // Takes same place as an uint8.
        // bytes30 left on SSTORAGE 1 after this.
        PartnerAuthorization authorization;

        // Last known owner of this Partner contract.
        // bytes10 left on SSTORAGE 1 after this.
        address owner;
    }

    // Partner contracts information mapping.
    mapping(address => PartnerInformation) private partnersRegistry;

    // Index of Partner contracts.
    address[] private partnersIndex;

    /**
     * @dev Owners of Partner contracts.
     * @dev We want to authorize the owners of the Partner contracts
     * @dev with which a partnership is established.
     */
    mapping(address => bool) private authorizedPartnerOwners;

    // Event when another Partner contract has asked partnership.
    event PartnershipRequested();

    // Event when another Partner contract has authorized our asked partnership.
    event PartnershipAccepted();

    /**
     * @dev Constructor.
     */
    constructor(uint8 _partnerCategory) public {
        partnerCategory = _partnerCategory;
    }

    /**
     * @dev This function will be used in inherited contracts,
     * @dev to restrict read access to owners of Partner contracts
     * @dev which have an established partnership with this contract.
     */
    function isAuthorizedPartnerOwner() public view returns (bool) {
        return authorizedPartnerOwners[msg.sender];
    }

    /**
     * @dev Get partnership status in another Partner contract.
     * @dev Works in pair with _getPartnerAuthorization.
     */
    function getPartnerAuthorization(address _address)
        external view onlyOwner returns (uint authorization)
    {
        // Interface with the contract we want to check.
        PartnerInterface partnerInterface = PartnerInterface(_address);

        // Read interface and return authorization status.
        authorization = partnerInterface._getPartnerAuthorization();
    }

    /**
     * @dev Works in pair with getPartnerAuthorization.
     */
    function _getPartnerAuthorization() external view returns (uint) {
        return uint(partnersRegistry[msg.sender].authorization);
    }

    /**
     * @dev Get the list of Partner contracts.
     */
    function getPartners() external view onlyOwner returns (address[]) {
        return partnersIndex;
    }

    /**
     * @dev Get a Partner.
     */
    function getPartner(address _address)
        external
        view
        onlyOwner
        returns (uint8, uint, address)
    {
          PartnerInformation memory partnerMemory = partnersRegistry[_address];

          return (
              partnerMemory.category,
              uint(partnerMemory.authorization),
              partnerMemory.owner
          );
    }

    /**
     * @dev Request partnership.
     */
    function requestPartnership(address _address) external onlyOwner {

        // Storage pointer on new Partner.
        PartnerInformation storage partnerStorage = partnersRegistry[_address];

        // We can only request a partnership if he's not already in our partners.
        // If he is, then we symetrically are already in his partners.
        // Indeed when he asked a partnership with us,
        // he added us as a partner.
        require(
            partnerStorage.authorization == PartnerAuthorization.Unknown,
            'Partner contract must be unknown'
        );

        // Interface with the contract for which we want to request partnership
        PartnerInterface partnerInterface = PartnerInterface(_address);

        // Read information from it.
        uint partnerInterfaceCategory = partnerInterface.partnerCategory();
        address partnerInterfaceOwner = partnerInterface.owner();

        require(
            partnerInterfaceCategory > 0,
            'Partner has no category'
        );

        // TODO: sure about this?
        require(
            partnerInterfaceCategory != partnerCategory,
            'Contracts of same category can not partnership'
        );

        // Request partnership in the other contract.
        bool success = partnerInterface._requestPartnership();

        // If partnership request was a success,
        if (success) {
            // Write in our registry.
            partnerStorage.category = uint8(partnerInterfaceCategory);
            partnerStorage.authorization = PartnerAuthorization.Authorized;
            partnerStorage.owner = partnerInterfaceOwner;

            // Update our partners index.
            partnersIndex.push(_address);

            // Authorize the contract owner.
            authorizedPartnerOwners[partnerInterfaceOwner] = true;
        }
    }

    /**
     * @dev Symetry of requestPartnership.
     */
    function _requestPartnership() external returns (bool success) {

        PartnerInformation storage partnerStorage = partnersRegistry[msg.sender];

        require(
            partnerStorage.authorization == PartnerAuthorization.Unknown,
            'Partnership already initiated'
        );

        // Interface with the contract that requests partnership.
        PartnerInterface partnerInterface = PartnerInterface(msg.sender);

        // Read information from it.
        uint partnerInterfaceCategory = partnerInterface.partnerCategory();

        require(
            partnerInterfaceCategory > 0,
            'Partner has no category'
        );

        // TODO: sure about this?
        require(
            partnerInterfaceCategory != partnerCategory,
            'Contracts of same category can not partnership'
        );

        // Write to our partners registry.
        partnerStorage.category = uint8(partnerInterfaceCategory);
        partnerStorage.authorization = PartnerAuthorization.Pending;

        // Add the new partner to our partners index.
        partnersIndex.push(msg.sender);

        emit PartnershipRequested();

        // Return success.
        success = true;
    }

    /**
     * @dev Authorize Partner.
     */
    function authorizePartner(address _address) external onlyOwner {

        PartnerInformation storage partnerStorage = partnersRegistry[_address];

        require(
            partnerStorage.authorization == PartnerAuthorization.Pending,
            'Partner must be Pending'
        );

        // Interface with the contract we will authorize.
        PartnerInterface partnerInterface = PartnerInterface(_address);

        // Read information from it.
        address partnerInterfaceOwner = partnerInterface.owner();

        // Write to our partners registry.
        partnerStorage.authorization = PartnerAuthorization.Authorized;
        partnerStorage.owner = partnerInterfaceOwner;

        // Authorize the contract owner.
        authorizedPartnerOwners[partnerInterfaceOwner] = true;

        // Log an event in the new authorized partner contract.
        partnerInterface._notifyPartnershipAccepted();
    }

    /**
     * @dev Function for a Partner contract to send an event, when authorizing.
     */
    function _notifyPartnershipAccepted() external {

        require(
            partnersRegistry[msg.sender].authorization == PartnerAuthorization.Authorized,
            'Only authorized partner can notify authorization'
        );

        emit PartnershipAccepted();

    }

    /**
     * @dev Reject Partner.
     */
    function rejectPartner(address _address) external onlyOwner {

        PartnerInformation storage partnerStorage = partnersRegistry[_address];

        require(
            partnerStorage.authorization == PartnerAuthorization.Pending,
            'Partner must be Pending'
        );

        partnerStorage.authorization = PartnerAuthorization.Rejected;
    }

    /**
     * @dev Remove Partner.
     */
    function removePartner(address _address) external onlyOwner {

        PartnerInformation storage partnerStorage = partnersRegistry[_address];

        require(
            (
                partnerStorage.authorization == PartnerAuthorization.Authorized ||
                partnerStorage.authorization == PartnerAuthorization.Rejected
            ),
            'Partner must be Authorized or Rejected'
        );

        // Remove ourselves in the partner contract.
        PartnerInterface partnerInterface = PartnerInterface(_address);
        bool success = partnerInterface._removePartner();

        // Remove the partner.
        if (success) {
            // Remove in registry.
            partnerStorage.authorization = PartnerAuthorization.Unknown;

            // Not necessary to update category & owner in registry.

            // Unauthorize owner.
            address partnerInterfaceOwner = partnerInterface.owner();
            authorizedPartnerOwners[partnerInterfaceOwner] = false;
        }
    }

    /**
     * @dev Symetry of removePartner.
     */
    function _removePartner() external returns (bool success) {

         PartnerInformation storage partnerStorage = partnersRegistry[msg.sender];
         PartnerInterface partnerInterface = PartnerInterface(msg.sender);

         address partnerInterfaceOwner = partnerInterface.owner();

         // Remove partner contract from registry.
         partnerStorage.authorization = PartnerAuthorization.Unknown;

         // Unauthorize owner.
         authorizedPartnerOwners[partnerInterfaceOwner] = false;

         success = true;
    }

    /**
     * @dev Update partner owners.
     * @dev To call if this contract changes ownership.
     */
    function updatePartnerOwner() external onlyOwner {
        PartnerInterface partnerInterface;
        // Loop through our known partners.
        for (uint i = 0; i < partnersIndex.length; i++) {
            // If the partnership is authorized,
            if (partnersRegistry[partnersIndex[i]].authorization == PartnerAuthorization.Authorized) {
              // For each authorized, get the interface.
              partnerInterface = PartnerInterface(partnersIndex[i]);
              // Then update us in the partner contract.
              partnerInterface._updatePartnerOwner();
            }
        }
    }

    /**
     * @dev Symetry of updatePartnerOwner.
     */
    function _updatePartnerOwner() external {
        // Storage pointer & init interface.
        PartnerInformation storage partnerStorage = partnersRegistry[msg.sender];
        PartnerInterface partnerInterface = PartnerInterface(msg.sender);

        // Unauthorize previous known owner.
        authorizedPartnerOwners[partnerStorage.owner] = false;

        // Get current owner.
        address partnerInterfaceOwner = partnerInterface.owner();

        // Update owner in registry.
        partnerStorage.owner = partnerInterfaceOwner;

        // If partnership is active,
        if (partnersRegistry[msg.sender].authorization == PartnerAuthorization.Authorized) {
            // Authorize current owner.
            authorizedPartnerOwners[partnerInterfaceOwner] = true;
        }
    }
}


/**
 * @title Interface with clones or inherited contracts.
 */
interface PartnerInterface {
  function _getPartnerAuthorization() external view returns (uint8);
  function _requestPartnership() external view returns (bool);
  function _notifyPartnershipAccepted() external;
  function _removePartner() external returns (bool success);
  function _updatePartnerOwner() external;
  function partnerCategory() external view returns (uint);
  function owner() external view returns (address);
}
