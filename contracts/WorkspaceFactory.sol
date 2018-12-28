pragma solidity ^0.4.24;

import "./ownership/Ownable.sol";
import "./token/TalaoToken.sol";
import "./Foundation.sol";
import "./Workspace.sol";

/**
 * @title WorkspaceFactory contract.
 * @notice This contract can generate Workspaces and connect them with Foundation.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */

contract WorkspaceFactory is Ownable {

    // Foundation contract.
    Foundation foundation;

    // Talao token contract.
    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, address _token) public {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
    }

    /**
     * @dev Create a Workspace contract.
     */
    function createWorkspace (
        uint16 _category,
        uint16 _asymetricEncryptionKeyAlgorithm,
        uint16 _asymetricEncryptionKeyLength,
        uint16 _symetricEncryptionKeyAlgorithm,
        uint16 _symetricEncryptionKeyLength,
        bytes _asymetricEncryptionKeyPublic,
        bytes _symetricEncryptionKeyEncrypted
    )
        external
        returns (address)
    {
        // Sender must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(msg.sender, msg.sender),
            'Sender has no access to Vault.'
        );
        require(
            (
                _category == 1001 ||
                _category == 2001 ||
                _category == 3001 ||
                _category == 4001 ||
                _category == 5001
            ),
            'Invalid category'
        );
        // Create contract.
        Workspace newWorkspace = new Workspace(
            address(foundation),
            address(token),
            _category,
            _asymetricEncryptionKeyAlgorithm,
            _asymetricEncryptionKeyLength,
            _symetricEncryptionKeyAlgorithm,
            _symetricEncryptionKeyLength,
            _asymetricEncryptionKeyPublic,
            _symetricEncryptionKeyEncrypted
        );
        // Add an ECDSA ERC 725 key for initial owner with MANAGER purpose
        newWorkspace.addKey(keccak256(abi.encodePacked(msg.sender)), 1, 1);
        // Remove this factory ERC 725 MANAGER key.
        newWorkspace.removeKey(keccak256(abi.encodePacked(address(this))), 1);
        // Set initial owner in Foundation to msg.sender.
        foundation.setInitialOwnerInFoundation(address(newWorkspace), msg.sender);
        // Return new contract address.
        return address(newWorkspace);
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
