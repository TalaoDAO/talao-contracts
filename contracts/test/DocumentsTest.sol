pragma solidity ^0.4.24;

import "../access/Permissions.sol";
import "../content/Documents.sol";

/**
 * @title Independent Documents.sol implementation for tests.
 */
contract DocumentsTest is Permissions, Documents {

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
}
