pragma solidity ^0.4.24;

import "../access/Permissions.sol";

/**
 * @title Filebox contract.
 * @notice Contract to "send" and "receive" decentralized encrypted files.
 * @author Talao, Polynomial.
 */
contract Filebox is Permissions {

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
        bytes32 fileHash,
        uint16 fileEngine
    );

    /**
     * @dev "Send" a "file" to the owner.
     */
    function sendFilebox(bytes32 _fileHash, uint16 _fileEngine) external {
        require(
            !fileboxBlacklist[msg.sender],
            'You are blacklisted'
        );
        emit FileboxReceived(
            msg.sender,
            _fileHash,
            _fileEngine
        );
    }

    /**
     * @dev Set filebox.
     */
    function setFilebox(
        bytes32 _publicEncryptionKey,
        uint16 _encryptionKeyAlgorithm
    )
        external
        onlyOwnerInFoundationWithOpenVault
    {
        fileboxSettings.publicEncryptionKey = _publicEncryptionKey;
        fileboxSettings.encryptionKeyAlgorithm = _encryptionKeyAlgorithm;
    }

    /**
     * @dev Blacklist.
     */
    function blacklistAddressInFilebox(address _address)
        external
        onlyOwnerInFoundationWithOpenVault
    {
        fileboxBlacklist[_address] = true;
    }

    /**
     * @dev Unblacklist.
     */
    function unblacklistAddressInFilebox(address _address)
        external
        onlyOwnerInFoundationWithOpenVault
    {
        fileboxBlacklist[_address] = false;
    }
}
