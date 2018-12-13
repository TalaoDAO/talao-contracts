pragma solidity ^0.4.24;

import './Filebox.sol';
import './Tokenized.sol';
import './Profile.sol';
import './Documents.sol';
import './Freelancer.sol';

/**
 * @title Marketplace contract.
 * @notice This contract can generate Freelancers and connect with them.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 * @dev A Marketplace also has the same features as a Freelancer:
 * @dev a Filebox, a Profile, and Documents.
 */

contract Marketplace is Filebox, Tokenized, Profile, Documents {

    /**
     * @dev Constructor.
     */
    constructor(address _token)
        public
        Tokenized(3, _token)
    {
        partnerCategory = 3;
        token = TalaoToken(_token);
    }

    /**
     * @dev Create a Freelancer contract.
     */
    function createFreelancer (
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

        // Sender must not be an already known Partnership owner.
        require(
            partnershipsOwners[msg.sender].contractAddress == address(0),
            'Address already registered'
        );
        // Sender must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(msg.sender, msg.sender),
            'Sender has no access to Vault.'
        );

        // Create Freelancer contract.
        Freelancer newFreelancer = new Freelancer(token);

        // Request Partnership with Freelancer.
        requestPartnership(address(newFreelancer));

        // In Freelancer, accept Partnership.
        newFreelancer.authorizePartnership(address(this));

        // Set Freelancer's Public Profile.
        newFreelancer.setPublicProfile(
            _name1,
            _name2,
            _tagline,
            _url,
            _publicEmail,
            _pictureHash,
            _pictureEngine,
            _description
        );

        // Set Freelancer's Private Profile.
        newFreelancer.setPrivateProfile(
            _privateEmail,
            _mobile
        );

        // Transfer contract to user.
        newFreelancer.transferOwnership(msg.sender);

        // Return new contract address.
        return address(newFreelancer);
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
