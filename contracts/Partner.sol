pragma solidity ^0.4.24;

import './libraries/SafeMath.sol';
import './Ownable.sol';

/**
 * @title Interface with a Partner contract or a contract that inherits Partner.
 */
interface PartnerInterface {

  /**
   * @dev Request partnership with this other contract.
   */
  function requestPartnershipFromContract
      (uint8 _category) external view returns (bool);

  /**
   * @dev Get other contract information.
   */
  function partnerInformation() external view returns (uint8);

  /**
   * @dev Return partnershipstatus.
   */
  function returnPartnershipStatus() external view returns (uint8);
}

/**
 * @title Partner contract.
 * @notice This contract provides partner functionnalities.
 * @notice Inherited by Freelancer and Marketplace contracts.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 * @dev A Partner has to ask this contract to be a Partner.
 * @dev It will have the Pending status.
 * @dev When this contract owner validates the partnership,
 * @dev then it gets the Authorized status.
 * @dev In Freelancer, a Partner is usually a Marketplace contract.
 * @dev In Marketplace, a Partner is usually a Freelancer contract.
 * @dev Any contract or Ethereum user can potentially ask for partnership.
 * @dev This contract owner should carefully review the partnership requests!
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

    // Partnership asked event.
    // Basically it's just to let know the owner when partnerships are asked.
    // We don't want to log an address here.
    // Frontend will have to call getPartners().
    // Also, it would not be usefull to emit an event for our own actions.
    event PartnershipAsked();

    /**
     * @dev Constructor.
     */
    constructor(uint8 _category) public {
        partnerInformation.category = _category;
    }

    /**
     * @dev Getter to see if msg.sender is an Authorized partner.
     * @dev Use this fonction to restrict access in contracts
     * @dev inherit Partner!
     */
    function isPartner() public view returns (bool) {
        return KnownPartners[msg.sender].authorization == PartnerAuthorization.Authorized;
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
     * @dev Getter for the owner to see his partnership status in another contract.
     * @dev works with returnPartnershipStatus
     */
    function getPartnershipStatus(address _partner)
        external view onlyOwner returns (uint authorization)
    {
        // The contract for which we want to see our partnership status.
        PartnerInterface hisContract = PartnerInterface(_partner);

        // Return authorization status.
        authorization = hisContract.returnPartnershipStatus();
    }

    /**
     * @dev Getter for a symetrical contract to see his partnership status.
     */
    function returnPartnershipStatus() external view returns (uint) {
        return uint(KnownPartners[msg.sender].authorization);
    }

    /**
     * @dev Request partnership, called by another Partner contract.
     * @dev This is called by the contract/address trying to be a Partner.
     * @dev This is not called by this contract owner!
     * @dev This contract owner must call requestPartnership()
     */
    function requestPartnershipFromContract
        (uint8 _category) external returns (bool success) {

        KnownPartner storage newPartner = KnownPartners[msg.sender];

        require(
            msg.sender != owner(),
            'Owner must call requestPartnership'
        );

        require(
            newPartner.authorization == PartnerAuthorization.Unknown,
            'Partnership already initiated'
        );

        require(
            _category > 0,
            '_category must be > 0'
        );

        newPartner.category = _category;
        newPartner.authorization = PartnerAuthorization.Pending;

        knownPartnersIndex.push(msg.sender);

        emit PartnershipAsked();

        // Return success.
        success = true;
    }

    /**
     * @dev Request partnership.
     * @dev This is called by the owner.
     * @dev Internally, it will instantiate the symetrical Partner contract
     * @dev and call its symetrical requestPartnershipIn function.
     * @dev At last, we will automatically add the asked partner as
     * @dev one of our authorized partners.
     */
    function requestPartnership(address _partner)
        external
        onlyOwner
    {

        // Storage pointer on future Partner.
        KnownPartner storage newPartner = KnownPartners[_partner];

        // We can only request a partnership if he's not already in our partners.
        // If he is, then we symetrically are already in his partners.
        // Indeed when he asked a partnership with us,
        // he added us as a partner.
        require(
            newPartner.authorization == PartnerAuthorization.Unknown,
            'Partner must be unknown'
        );

        // The contract for which we want to request partnership
        PartnerInterface otherContract = PartnerInterface(_partner);

        // Read information from other contract.
        uint8 newPartnerCategory = otherContract.partnerInformation();

        // Partner must have a category.
        require(
            newPartnerCategory > 0,
            'Partner has no category'
        );

        // Request partnership in the other contract.
        bool success = otherContract.requestPartnershipFromContract(
            partnerInformation.category
        );

        // If partnership request was a success,
        if (success) {
            newPartner.category = newPartnerCategory;
            newPartner.authorization = PartnerAuthorization.Authorized;

            knownPartnersIndex.push(_partner);
        }
    }

    /**
     * @dev Authorize Partner.
     */
    function authorizePartner(address _partner) external onlyOwner {

        KnownPartner storage thisPartner = KnownPartners[_partner];

        require(
            (
                thisPartner.authorization == PartnerAuthorization.Pending ||
                thisPartner.authorization == PartnerAuthorization.Rejected
            ),
            'Partner must be Pending or Rejected'
        );

        thisPartner.authorization = PartnerAuthorization.Authorized;
    }

    /**
     * @dev Reject Partner.
     */
    function rejectPartner(address _partner) external onlyOwner {

        KnownPartner storage thisPartner = KnownPartners[_partner];

        require(
            (
                thisPartner.authorization == PartnerAuthorization.Pending ||
                thisPartner.authorization == PartnerAuthorization.Authorized
            ),
            'Partner must be Pending or Authorized'
        );

        thisPartner.authorization = PartnerAuthorization.Rejected;
    }
}
