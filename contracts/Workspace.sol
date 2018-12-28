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
        uint16 _asymetricEncryptionKeyAlgorithm,
        uint16 _asymetricEncryptionKeyLength,
        uint16 _symetricEncryptionKeyAlgorithm,
        uint16 _symetricEncryptionKeyLength,
        bytes _asymetricEncryptionKeyPublic,
        bytes _symetricEncryptionKeyEncrypted
    )
        Permissions(
            _foundation,
            _token,
            _category,
            _asymetricEncryptionKeyAlgorithm,
            _asymetricEncryptionKeyLength,
            _symetricEncryptionKeyAlgorithm,
            _symetricEncryptionKeyLength,
            _asymetricEncryptionKeyPublic,
            _symetricEncryptionKeyEncrypted
        )
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        identityInformation.creator = msg.sender;
        identityInformation.category = _category;
        identityInformation.asymetricEncryptionKeyAlgorithm = _asymetricEncryptionKeyAlgorithm;
        identityInformation.asymetricEncryptionKeyLength = _asymetricEncryptionKeyLength;
        identityInformation.symetricEncryptionKeyAlgorithm = _symetricEncryptionKeyAlgorithm;
        identityInformation.symetricEncryptionKeyLength = _symetricEncryptionKeyLength;
        identityInformation.asymetricEncryptionKeyPublic = _asymetricEncryptionKeyPublic;
        identityInformation.symetricEncryptionKeyEncrypted = _symetricEncryptionKeyEncrypted;
    }

    // TODO: kill

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
