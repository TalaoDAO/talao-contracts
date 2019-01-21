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
        uint16 _asymetricEncryptionAlgorithm,
        uint16 _symetricEncryptionAlgorithm,
        bytes _asymetricEncryptionPublicKey,
        bytes _symetricEncryptionEncryptedKey,
        bytes _encryptedSecret
    )
        Permissions(
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
}
