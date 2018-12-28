pragma solidity ^0.4.24;

import "../content/Filebox.sol";

/**
 * @title Filebox contract.
 * @notice Contract to "send" and "receive" decentralized encrypted files.
 * @author Talao, Polynomial.
 */
contract FileboxTest is Permissions, Filebox {

    /**
     * @dev Constructor.
     */
    constructor(
        address _foundation,
        address _token,
        uint16 _category,
        uint16 _asymetricEncryptionAlgorithm,
        uint16 _symetricEncryptionAlgorithm,
        bytes _asymetricEncryptionPublickey,
        bytes symetricEncryptionEncryptedpassphrase
    )
        Permissions(
            _foundation,
            _token,
            _category,
            _asymetricEncryptionAlgorithm,
            _symetricEncryptionAlgorithm,
            _asymetricEncryptionPublickey,
            symetricEncryptionEncryptedpassphrase
        )
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        identityInformation.creator = msg.sender;
        identityInformation.category = _category;
        identityInformation.asymetricEncryptionAlgorithm = _asymetricEncryptionAlgorithm;
        identityInformation.symetricEncryptionAlgorithm = _symetricEncryptionAlgorithm;
        identityInformation.asymetricEncryptionPublickey = _asymetricEncryptionPublickey;
        identityInformation.symetricEncryptionEncryptedPassphrase = symetricEncryptionEncryptedpassphrase;
    }
}
