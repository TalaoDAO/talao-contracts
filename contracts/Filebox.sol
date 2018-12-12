pragma solidity ^0.4.24;

import './ownership/Ownable.sol';

/**
 * @title Filebox contract.
 * @notice This contract allows to receive decentralized encrypted files.
 * @author Talao, Polynomial.
 */
contract Filebox is Ownable {

    // Settings.
    struct FileboxSettings {
      // Public encryption key.
      // Any file notified to us should have been encrypted with this key,
      // before uploading it to the decentralized files engine.
      // SSTORAGE 1 full after this.
      bytes32 publicEncryptionKey;

      // The encryption algorithm we want to be used to interact with us.
      // bytes30 left after this.
      uint16 encryptionKeyAlgorithm;
    }
    FileboxSettings public fileboxSettings;

    // Blacklisted addresses.
    mapping(address => bool) public fileboxBlacklist;

    // Event emitted when someone left us an decentralized encrypted file.
    event FileboxReceived (
        address indexed sender,
        bytes32 publicEncryptionKey,
        uint16 encryptionAlgorithm,
        bytes32 fileHash,
        uint16 fileEngine
    );

    /**
     * @dev Send a file to the owner.
     */
    function fileboxSend
    (
        bytes32 _publicEncryptionKey,
        uint16 _encryptionKeyAlgorithm,
        bytes32 _fileHash,
        uint16 _fileEngine
    )
        external
    {
        require(
            !fileboxBlacklist[msg.sender],
            'You are blacklisted'
        );
        emit FileboxReceived(
            msg.sender,
            _publicEncryptionKey,
            _encryptionKeyAlgorithm,
            _fileHash,
            _fileEngine
        );
    }

    /**
     * @dev Configure.
     */
    function fileboxConfigure(
        bytes32 _publicEncryptionKey,
        uint16 _encryptionKeyAlgorithm
    )
        external onlyOwner
    {
        fileboxSettings.publicEncryptionKey = _publicEncryptionKey;
        fileboxSettings.encryptionKeyAlgorithm = _encryptionKeyAlgorithm;
    }

    /**
     * @dev Blacklist.
     */
    function fileboxBlacklist(address _address) external onlyOwner {
        fileboxBlacklist[_address] = true;
    }

    /**
     * @dev Unblacklist.
     */
    function fileboxUnblacklist(address _address) external onlyOwner {
        fileboxBlacklist[_address] = false;
    }
}
