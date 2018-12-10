pragma solidity ^0.4.24;

import './libraries/SafeMath.sol';
import './Ownable.sol';

/**
 * @title Partner contract.
 * @notice This contract provides partner functionnalities.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 * @dev Partners are contracts that inherit this contract.
 * @dev Owners can request to establish partnerships with other Partner contracts.
 * @dev We use some symetrical functions to do this.
 * @dev This contract owner should carefully review the partnership requests!
 * @dev
 * @dev "Symetrical" functions
 * @dev ====================
 * @dev 1) User1 calls owner_doSomething(_address2) in his contract Partner1
 * @dev 2) Partner1 opens the interface function partner_doSomething() at _address2
 * @dev 3) Partner2 contracts returns the result to Partner1
 * @dev 4) Partner1 returns the result to User1
 * @dev Convention
 * @dev ==========
 * @dev Function meant to be called by owner should start by owner_
 * @dev Function meant to be called by partner contract should start by partner_
 * @dev Exceptions: some partner_doSomething can be called doSomething if it is
 * @dev meant to be called directly by a user, as well, and not only by
 * @dev a Partner contract.
 */
contract Partner is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Partner authorization status.
    enum PartnerAuthorization { Unknown, Authorized, Pending, Rejected }

    // Struct for one know Partner.
    struct KnownPartner {
        // Partner category.
        // We use uint8 instead of enum so we can add categories in the future.
        // bytes31 left on SSTORAGE 1 after this.
        uint8 category;

        // Authorization of this partner.
        // Takes same place as an uint8.
        // bytes30 left on SSTORAGE 1 after this.
        PartnerAuthorization authorization;

        // TODO: bytes30 left on SSTORAGE 1.
    }

    // Known Partners mapping.
    mapping (address => KnownPartner) KnownPartners;

    // Index of known Partners.
    // Includes all authorizations and all categories.
    // This is to avoid maintaining a lot of indexes.
    // Filtering is done on the frontend.
    // See getParners().
    address[] knownPartnersIndex;

    // This contract Partner information.
    // Not a full profile, only the minimum needed
    // to exchange with other Partner contracts.
    struct PartnerInformation {
        // Partner category.
        // We use uint8 instead of enum so we can add categories in the future.
        // bytes31 left on SSTORAGE 1 after this.
        uint8 category;

        // TODO: bytes31 left on SSTORAGE 1.
    }
    PartnerInformation public partnerInformation;

    // Event when another Partner contract has asked partnership.
    event PartnershipAsked();

    // Event when another Partner contract has authorized our asked partnership.
    event PartnershipAuthorized();

    /**
     * @dev Constructor.
     */
    constructor(uint8 _category) public {
        partnerInformation.category = _category;
    }

    /**
     * @dev Get if sender is an authorized partner.
     */
    function isPartner() public view returns (bool) {
        return KnownPartners[msg.sender].authorization == PartnerAuthorization.Authorized;
    }

    /**
     * @dev Get if sender is an authorized partner of a certain category.
     */
    function isPartnerCategory(uint _category) public view returns (bool) {
        return KnownPartners[msg.sender].category == _category;
    }

    /**
     * @dev Get partnership status in another Partner contract.
     */
    function owner_getPartnershipStatus(address _partner)
        external view onlyOwner returns (uint authorization)
    {
        // The contract for which we want to see our partnership status.
        PartnerInterface hisContract = PartnerInterface(_partner);

        // Return authorization status.
        authorization = hisContract.partner_getPartnershipStatus();
    }

    /**
     * @dev Symetry of owner_getPartnershipStatus.
     */
    function partner_getPartnershipStatus() external view returns (uint) {
        return uint(KnownPartners[msg.sender].authorization);
    }

    /**
     * @dev Get the list of Partners.
     */
    function getPartners()
        external view onlyOwner returns (address[] partners)
    {
        partners = knownPartnersIndex;
    }

    /**
     * @dev Get a Partner.
     */
    function getPartner(address _partner)
        external
        view
        onlyOwner
        returns (uint8 category, uint authorization)
    {
          KnownPartner memory thisPartner = KnownPartners[_partner];

          category = thisPartner.category;
          authorization = uint(thisPartner.authorization);
    }

    /**
     * @dev Request partnership.
     */
    function owner_requestPartnership(address _newPartner) external onlyOwner {

        // Storage pointer on new Partner.
        KnownPartner storage newPartner = KnownPartners[_newPartner];

        // We can only request a partnership if he's not already in our partners.
        // If he is, then we symetrically are already in his partners.
        // Indeed when he asked a partnership with us,
        // he added us as a partner.
        require(
            newPartner.authorization == PartnerAuthorization.Unknown,
            'Partner must be unknown'
        );

        // The contract for which we want to request partnership
        PartnerInterface otherContract = PartnerInterface(_newPartner);

        // Read information from other contract.
        uint8 newPartnerCategory = otherContract.partnerInformation();

        require(
            newPartnerCategory > 0,
            'Partner has no category'
        );

        // TODO: sure about this?
        require(
            newPartnerCategory != partnerInformation.category,
            'Partners of same category can not partnership'
        );

        // Request partnership in the other contract.
        bool success = otherContract.partner_requestPartnership();

        // If partnership request was a success,
        if (success) {
            newPartner.category = newPartnerCategory;
            newPartner.authorization = PartnerAuthorization.Authorized;

            knownPartnersIndex.push(_newPartner);
        }
    }

    /**
     * @dev Symetry of owner_requestPartnership.
     */
    function partner_requestPartnership() external returns (bool success) {

        KnownPartner storage newPartner = KnownPartners[msg.sender];

        require(
            msg.sender != owner(),
            'Owner must call owner_requestPartnership'
        );

        require(
            newPartner.authorization == PartnerAuthorization.Unknown,
            'Partnership already initiated'
        );

        // Get category of contract requesting partnership.
        PartnerInterface requestingPartner = PartnerInterface(msg.sender);
        uint8 newPartnerCategory = requestingPartner.partnerInformation();

        require(
            newPartnerCategory > 0,
            'Partner has no category'
        );

        // TODO: sure about this?
        require(
            newPartnerCategory != partnerInformation.category,
            'Partners of same category can not partnership'
        );

        newPartner.category = newPartnerCategory;
        newPartner.authorization = PartnerAuthorization.Pending;

        knownPartnersIndex.push(msg.sender);

        emit PartnershipAsked();

        // Return success.
        success = true;
    }

    /**
     * @dev Authorize Partner.
     */
    function authorizePartner(address _thisPartner) external onlyOwner {

        KnownPartner storage thisPartner = KnownPartners[_thisPartner];

        require(
            thisPartner.authorization == PartnerAuthorization.Pending,
            'Partner must be Pending'
        );

        thisPartner.authorization = PartnerAuthorization.Authorized;

        // Log an event in the new authorized partner contract.
        PartnerInterface authorizedContract = PartnerInterface(_thisPartner);
        authorizedContract.partner_notifyAuthorization();
    }

    /**
     * @dev Function for a Partner contract to send an event, when authorizing.
     */
    function partner_notifyAuthorization() external {

        require(
            KnownPartners[msg.sender].authorization == PartnerAuthorization.Authorized,
            'Only authorized partner can notify authorization'
        );

        emit PartnershipAuthorized();

    }

    /**
     * @dev Reject Partner.
     */
    function rejectPartner(address _address) external onlyOwner {

        KnownPartner storage thisPartner = KnownPartners[_address];

        require(
            thisPartner.authorization == PartnerAuthorization.Pending,
            'Partner must be Pending'
        );

        thisPartner.authorization = PartnerAuthorization.Rejected;
    }

    /**
     * @dev Remove Partner.
     */
    function removePartner(address _address) external onlyOwner {

        KnownPartner storage thisPartner = KnownPartners[_address];

        require(
            (
                thisPartner.authorization == PartnerAuthorization.Authorized ||
                thisPartner.authorization == PartnerAuthorization.Rejected
            ),
            'Partner must be Authorized or Rejected'
        );

        // Ask the partner to remove ourselves.
        PartnerInterface partnerToRemove = PartnerInterface(_address);
        bool success = partnerToRemove.partner_removePartner();

        // Remove the partner.
        if (success) {
            thisPartner.authorization = PartnerAuthorization.Unknown;
        }
    }

    /**
     * @dev Symetry of removePartner.
     */
    function partner_removePartner() external returns (bool success) {

         KnownPartner storage thisPartner = KnownPartners[msg.sender];

         thisPartner.authorization = PartnerAuthorization.Unknown;

         success = true;
    }
}


/**
 * @title Interface with clones or inherited contracts.
 */
interface PartnerInterface {

  function partner_requestPartnership() external view returns (bool);

  function partner_notifyAuthorization() external;

  function partner_getPartnershipStatus() external view returns (uint8);

  function partner_removePartner() external returns (bool success);

  function partnerInformation() external view returns (uint8);
}
