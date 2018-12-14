pragma solidity ^0.4.24;

import './ownership/Ownable.sol';
import './TalaoToken.sol';
import './Foundation.sol';
import './Workspace.sol';

/**
 * @title WorkspaceFactory contract.
 * @notice This contract can generate Workspaces and connect them with Foundation.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */

contract WorkspaceFoundationFactory is Ownable {

    // Talao token.
    TalaoToken public token;

    // Interface with Foundation.
    FoundationInterface foundation;

    /**
     * @dev Constructor.
     */
    constructor(address _token, address _foundation) public {
        token = TalaoToken(_token);
        foundation = FoundationInterface(_foundation);
    }

    /**
     * @dev Create a Workspace contract.
     */
    function createWorkspace (
        uint8 _category,
        bytes32 _name1,
        bytes32 _name2,
        bytes32 _tagline,
        bytes32 _url,
        bytes32 _publicEmail,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        string _description,
        bytes32 _privateEmail,
        bytes16 _mobile
    )
        external returns (address)
    {

        // Sender must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(msg.sender, msg.sender),
            'Sender has no access to Vault.'
        );

        // Create contract.
        Workspace newWorkspace = new Workspace(_category, token);

        // Set Public Profile.
        newWorkspace.setPublicProfile(
            _name1,
            _name2,
            _tagline,
            _url,
            _publicEmail,
            _pictureHash,
            _pictureEngine,
            _description
        );

        // Set Private Profile.
        newWorkspace.setPrivateProfile(
            _privateEmail,
            _mobile
        );

        // Register account to contract relationship in Foundation.
        foundation.addFoundationAccount(msg.sender, address(newWorkspace));

        // Transfer contract to user.
        newWorkspace.transferOwnership(msg.sender);

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

/**
 * @title Interface with Foundation.
 */
interface FoundationInterface {
    function addFoundationAccount(address _account, address _contract) external;
}
