pragma solidity ^0.4.24;

import "./ownership/OwnableUpdated.sol";
import "./token/TalaoToken.sol";
import "./Foundation.sol";
import "./Workspace.sol";

/**
 * @title WorkspaceFactory contract.
 * @notice This contract can generate Workspaces and connect them with Foundation.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */

contract WorkspaceFactory is OwnableUpdated {

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
        uint16 _asymetricEncryptionAlgorithm,
        uint16 _symetricEncryptionAlgorithm,
        bytes _asymetricEncryptionPublicKey,
        bytes _symetricEncryptionEncryptedKey,
        bytes _encryptedSecret,
        bytes _email
    )
        external
        returns (address)
    {
        // Sender must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(msg.sender, msg.sender),
            "Sender has no access to Vault"
        );
        require(
            (
                _category == 1001 ||
                _category == 2001 ||
                _category == 3001 ||
                _category == 4001 ||
                _category == 5001
            ),
            "Invalid category"
        );
        // Create contract.
        Workspace newWorkspace = new Workspace(
            address(foundation),
            address(token),
            _category,
            _asymetricEncryptionAlgorithm,
            _symetricEncryptionAlgorithm,
            _asymetricEncryptionPublicKey,
            _symetricEncryptionEncryptedKey,
            _encryptedSecret
        );
        // Add the email.
        // @see https://github.com/ethereum/EIPs/issues/735#issuecomment-450647097
        newWorkspace.addClaim(101109097105108, 1, msg.sender, "", _email, "");
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
        revert("Prevent accidental sending of ether");
    }
}
