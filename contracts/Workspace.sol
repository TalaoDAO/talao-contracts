pragma solidity ^0.4.24;

import "./access/Permissions.sol";
import "./content/Profile.sol";
import "./content/Documents.sol";
import "./content/Filebox.sol";

/**
 * @title A Workspace contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Workspace is Permissions, Profile, Documents, Filebox {

    /**
     * @dev Constructor.
     */
    constructor(
        address _foundation,
        address _token,
        uint16 _category,
        uint16 _symetricEncryptionKeyAlgorithm,
        uint16 _symetricEncryptionKeyLength,
        uint16 _asymetricEncryptionKeyAlgorithm,
        uint16 _asymetricEncryptionKeyLength,
        bytes _symetricEncryptionKeyEncrypted,
        bytes _asymetricPublicEncryptionKey
    )
        Permissions(
            _foundation,
            _token,
            _category,
            _symetricEncryptionKeyAlgorithm,
            _symetricEncryptionKeyLength,
            _asymetricEncryptionKeyAlgorithm,
            _asymetricEncryptionKeyLength,
            _symetricEncryptionKeyEncrypted,
            _asymetricPublicEncryptionKey
        )
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        identityInformation.creator = msg.sender;
        identityInformation.category = _category;
        identityInformation.symetricEncryptionKeyAlgorithm = _symetricEncryptionKeyAlgorithm;
        identityInformation.symetricEncryptionKeyLength = _symetricEncryptionKeyLength;
        identityInformation.asymetricEncryptionKeyAlgorithm = _asymetricEncryptionKeyAlgorithm;
        identityInformation.asymetricEncryptionKeyLength = _asymetricEncryptionKeyLength;
        identityInformation.symetricEncryptionKeyEncrypted = _symetricEncryptionKeyEncrypted;
        identityInformation.asymetricPublicEncryptionKey = _asymetricPublicEncryptionKey;
    }

    /**
     * @dev Constructor.
     */
    /* constructor(
        address _foundation,
        address _token,
        uint _partnerCategory,
        bytes32 _name1,
        bytes32 _name2,
        bytes32 _tagline,
        bytes32 _url,
        bytes32 _publicEmail,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        string _description
    )
        Permissions(_foundation, _token, _partnerCategory)
        public
    {
        creator = msg.sender;
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        partnerCategory = _partnerCategory;
        publicProfile.name1 = _name1;
        publicProfile.name2 = _name2;
        publicProfile.tagline = _tagline;
        publicProfile.url = _url;
        publicProfile.email = _publicEmail;
        publicProfile.pictureHash = _pictureHash;
        publicProfile.pictureEngine = _pictureEngine;
        publicProfile.description = _description;
    } */

    // TODO: kill

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
