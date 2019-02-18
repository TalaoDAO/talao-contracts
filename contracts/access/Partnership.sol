pragma solidity ^0.4.24;

import "../identity/Identity.sol";
import "../math/SafeMath.sol";

/**
 * @title Provides partnership features between contracts.
 * @notice If msg.sender is the owner, in the Foundation sense
 * (see Foundation.sol, of another partnership contract that is
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
 * Convention here: _function = to be called by another partnership contract.
 * @author Talao, Polynomial.
 */
contract Partnership is Identity {

    using SafeMath for uint;

    // Foundation contract.
    Foundation foundation;

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
        uint40 created;
        // His symetric encryption key,
        // encrypted on our asymetric encryption public key.
        bytes symetricEncryptionEncryptedKey;
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
    constructor(
        address _foundation,
        address _token,
        uint16 _category,
        uint16 _asymetricEncryptionAlgorithm,
        uint16 _symetricEncryptionAlgorithm,
        bytes _asymetricEncryptionPublicKey,
        bytes _symetricEncryptionEncryptedKey,
        bytes _encryptedSecret
    )
        Identity(
            _foundation,
            _token,
            _category,
            _asymetricEncryptionAlgorithm,
            _symetricEncryptionAlgorithm,
            _asymetricEncryptionPublicKey,
            _symetricEncryptionEncryptedKey,
            _encryptedSecret
        )
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        identityInformation.creator = msg.sender;
        identityInformation.category = _category;
        identityInformation.asymetricEncryptionAlgorithm = _asymetricEncryptionAlgorithm;
        identityInformation.symetricEncryptionAlgorithm = _symetricEncryptionAlgorithm;
        identityInformation.asymetricEncryptionPublicKey = _asymetricEncryptionPublicKey;
        identityInformation.symetricEncryptionEncryptedKey = _symetricEncryptionEncryptedKey;
        identityInformation.encryptedSecret = _encryptedSecret;
    }

    /**
     * @dev This function will be used in inherited contracts,
     * to restrict read access to members of Partnership contracts
     * which are authorized in this contract.
     */
    function isPartnershipMember() public view returns (bool) {
        return partnershipContracts[foundation.membersToContracts(msg.sender)].authorization == PartnershipAuthorization.Authorized;
    }

    /**
     * @dev Modifier version of isPartnershipMember.
     * Not used for now, but could be useful.
     */
    modifier onlyPartnershipMember() {
        require(isPartnershipMember());
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
        onlyIdentityPurpose(20003)
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
        onlyIdentityPurpose(20003)
        returns (uint, uint, uint40, bytes, bytes)
    {
        (
            ,
            uint16 hisCategory,
            ,
            ,
            bytes memory hisAsymetricEncryptionPublicKey,
            ,
        ) = IdentityInterface(_hisContract).identityInformation();
        return (
            hisCategory,
            uint(partnershipContracts[_hisContract].authorization),
            partnershipContracts[_hisContract].created,
            hisAsymetricEncryptionPublicKey,
            partnershipContracts[_hisContract].symetricEncryptionEncryptedKey
        );
    }

    /**
     * @dev Request partnership.
     * The owner of this contract requests a partnership
     * with another Partnership contract
     * through THIS contract.
     * We send him our symetric encryption key as well,
     * encrypted on his symetric encryption public key.
     * Encryption done offchain before submitting this TX.
     */
    function requestPartnership(address _hisContract, bytes _ourSymetricKey)
        external
        onlyIdentityPurpose(1)
    {
        // We can only request partnership with a contract
        // if he's not already Known or Removed in our registry.
        // If he is, we symetrically are already in his partnerships.
        // Indeed when he asked a partnership with us,
        // he added us in authorized partnerships.
        require(
            partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Unknown ||
            partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Removed
        );
        // Request partnership in the other contract.
        // Open interface on his contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        bool success = hisInterface._requestPartnership(_ourSymetricKey);
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
            partnershipContracts[_hisContract].created = uint40(now);
            // Give the Partnership contrat's owner an ERC 725 "Claim" key.
            addKey(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3, 1);
            // Give the Partnership contract an ERC 725 "Claim" key.
            addKey(keccak256(abi.encodePacked(_hisContract)), 3, 1);
            // Increment our number of partnerships.
            partnershipsNumber = partnershipsNumber.add(1);
        }
    }

    /**
     * @dev Symetry of requestPartnership.
     * Called by Partnership contract wanting to partnership.
     * He sends us his symetric encryption key as well,
     * encrypted on our symetric encryption public key.
     * So we can decipher all his content.
     */
    function _requestPartnership(bytes _hisSymetricKey)
        external
        returns (bool success)
    {
        require(
            partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Unknown ||
            partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Removed
        );
        // If this Partnership contract is Unknown,
        if (partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Unknown) {
            // Add the new partnership to our partnerships index.
            knownPartnershipContracts.push(msg.sender);
            // Record date of partnership creation.
            partnershipContracts[msg.sender].created = uint40(now);
        }
        // Write Pending to our partnerships contract registry.
        partnershipContracts[msg.sender].authorization = PartnershipAuthorization.Pending;
        // Record his symetric encryption key,
        // encrypted on our asymetric encryption public key.
        partnershipContracts[msg.sender].symetricEncryptionEncryptedKey = _hisSymetricKey;
        // Event for this contrat owner's UI.
        emit PartnershipRequested();
        // Return success.
        success = true;
    }

    /**
     * @dev Authorize Partnership.
     * Before submitting this TX, we must have encrypted our
     * symetric encryption key on his asymetric encryption public key.
     */
    function authorizePartnership(address _hisContract, bytes _ourSymetricKey)
        external
        onlyIdentityPurpose(1)
    {
        require(
            partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Pending,
            "Partnership must be Pending"
        );
        // Authorize the Partnership contract in our contract.
        partnershipContracts[_hisContract].authorization = PartnershipAuthorization.Authorized;
        // Record the date of partnership creation.
        partnershipContracts[_hisContract].created = uint40(now);
        // Give the Partnership contrat's owner an ERC 725 "Claim" key.
        addKey(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3, 1);
        // Give the Partnership contract an ERC 725 "Claim" key.
        addKey(keccak256(abi.encodePacked(_hisContract)), 3, 1);
        // Increment our number of partnerships.
        partnershipsNumber = partnershipsNumber.add(1);
        // Log an event in the new authorized partner contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        hisInterface._authorizePartnership(_ourSymetricKey);
    }

    /**
     * @dev Allows other Partnership contract to send an event when authorizing.
     * He sends us also his symetric encryption key,
     * encrypted on our asymetric encryption public key.
     */
    function _authorizePartnership(bytes _hisSymetricKey) external {
        require(
            partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Authorized,
            "You have no authorized partnership"
        );
        partnershipContracts[msg.sender].symetricEncryptionEncryptedKey = _hisSymetricKey;
        emit PartnershipAccepted();
    }

    /**
     * @dev Reject Partnership.
     */
    function rejectPartnership(address _hisContract)
        external
        onlyIdentityPurpose(1)
    {
        require(
            partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Pending,
            "Partner must be Pending"
        );
        partnershipContracts[_hisContract].authorization = PartnershipAuthorization.Rejected;
    }

    /**
     * @dev Remove Partnership.
     */
    function removePartnership(address _hisContract)
        external
        onlyIdentityPurpose(1)
    {
        require(
            (
                partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Authorized ||
                partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Rejected
            ),
            "Partnership must be Authorized or Rejected"
        );
        // Remove ourselves in the other Partnership contract.
        PartnershipInterface hisInterface = PartnershipInterface(_hisContract);
        bool success = hisInterface._removePartnership();
        // If success,
        if (success) {
            // If it was an authorized partnership,
            if (partnershipContracts[_hisContract].authorization == PartnershipAuthorization.Authorized) {
                // Remove the partnership creation date.
                delete partnershipContracts[_hisContract].created;
                // Remove his symetric encryption key.
                delete partnershipContracts[_hisContract].symetricEncryptionEncryptedKey;
                // Decrement our number of partnerships.
                partnershipsNumber = partnershipsNumber.sub(1);
            }
            // If there is one, remove ERC 725 "Claim" key for Partnership contract owner.
            if (keyHasPurpose(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3)) {
                removeKey(keccak256(abi.encodePacked(foundation.contractsToOwners(_hisContract))), 3);
            }
            // If there is one, remove ERC 725 "Claim" key for Partnership contract.
            if (keyHasPurpose(keccak256(abi.encodePacked(_hisContract)), 3)) {
                removeKey(keccak256(abi.encodePacked(_hisContract)), 3);
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
     * Called by the Partnership contract breaking partnership with us.
     */
    function _removePartnership() external returns (bool success) {
        // He wants to break partnership with us, so we break too.
        // If it was an authorized partnership,
        if (partnershipContracts[msg.sender].authorization == PartnershipAuthorization.Authorized) {
            // Remove date of partnership creation.
            delete partnershipContracts[msg.sender].created;
            // Remove his symetric encryption key.
            delete partnershipContracts[msg.sender].symetricEncryptionEncryptedKey;
            // Decrement our number of partnerships.
            partnershipsNumber = partnershipsNumber.sub(1);
        }
        // Would have liked to remove ERC 725 "Claim" keys here.
        // Unfortunately we can not automate this. Indeed it would require
        // the Partnership contract to have an ERC 725 Management key.

        // Remove his authorization.
        partnershipContracts[msg.sender].authorization = PartnershipAuthorization.Removed;
        // We return to the calling contract that it's done.
        success = true;
    }

    /**
     * @dev Internal function to remove partnerships before selfdestruct.
     */
    function cleanupPartnership() internal returns (bool success) {
        // For each known Partnership contract
        for (uint i = 0; i < knownPartnershipContracts.length; i++) {
            // If it was an authorized partnership,
            if (partnershipContracts[knownPartnershipContracts[i]].authorization == PartnershipAuthorization.Authorized) {
                // Remove ourselves in the other Partnership contract.
                PartnershipInterface hisInterface = PartnershipInterface(knownPartnershipContracts[i]);
                hisInterface._removePartnership();
            }
        }
        success = true;
    }
}


/**
 * @title Interface with clones, inherited contracts or services.
 */
interface PartnershipInterface {
    function _requestPartnership(bytes) external view returns (bool);
    function _authorizePartnership(bytes) external;
    function _removePartnership() external returns (bool success);
    function getKnownPartnershipsContracts() external returns (address[]);
    function getPartnership(address)
        external
        returns (uint, uint, uint40, bytes, bytes);
}
