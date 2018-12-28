pragma solidity ^0.4.24;

import "../access/Permissions.sol";

/**
 * @title Filebox contract.
 * @notice Contract to "send" and "receive" decentralized encrypted files.
 * @author Talao, Polynomial.
 */
contract Filebox is Permissions {

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
     * @dev Blacklist.
     */
    function blacklistAddressInFilebox(address _address)
        external
        onlyIdentityPurpose(20004)
    {
        fileboxBlacklist[_address] = true;
    }

    /**
     * @dev Unblacklist.
     */
    function unblacklistAddressInFilebox(address _address)
        external
        onlyIdentityPurpose(20004)
    {
        fileboxBlacklist[_address] = false;
    }
}
