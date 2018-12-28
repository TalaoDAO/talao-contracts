pragma solidity ^0.4.24;

import "../access/Permissions.sol";

/**
 * @title Profile contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Profile is Permissions {

    // Public profile.
    struct PublicProfile {
        // Name1 (First name, company name, ...)
        // SSTORAGE 1 filled after this.
        bytes32 name1;

        // Name2 (Last name, ...)
        // SSTORAGE 2 filled after this.
        bytes32 name2;

        // Tagline (Freelance job title, company slogan, ...)
        // SSTORAGE 3 filled after this.
        bytes32 tagline;

        // URL (Website, ...)
        // SSTORAGE 4 filled after this.
        bytes32 url;

        // Public email.
        // SSTORAGE 5 filled after this.
        bytes32 email;

        // File hash of the profile picture.
        // SSTORAGE 7 filled after this.
        bytes32 pictureHash;

        // ID of the file engine used for the picture.
        // bytes30 left on SSTORAGE 8 after this.
        uint16 pictureEngine;

        // Description.
        string description;
    }
    PublicProfile public publicProfile;

    // "Private" profile.
    // Access controlled by Permissions.sol.
    // Nothing is really private on the blockchain.
    struct PrivateProfile {
        // Private email.
        bytes email;

        // Mobile number.
        bytes mobile;
    }
    PrivateProfile internal privateProfile;

    /**
     * @dev Get private profile.
     */
    function getPrivateProfile()
        external
        view
        onlyReader
        returns (bytes, bytes)
    {
        return (
            privateProfile.email,
            privateProfile.mobile
        );
    }

    /**
     * @dev Set profile.
     */
    function setProfile(
        bytes32 _name1,
        bytes32 _name2,
        bytes32 _tagline,
        bytes32 _url,
        bytes32 _publicEmail,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        string _description,
        bytes _privateEmail,
        bytes _mobile
    )
        external
        onlyIdentityPurpose(20002)
    {
        publicProfile.name1 = _name1;
        publicProfile.name2 = _name2;
        publicProfile.tagline = _tagline;
        publicProfile.url = _url;
        publicProfile.email = _publicEmail;
        publicProfile.pictureHash = _pictureHash;
        publicProfile.pictureEngine = _pictureEngine;
        publicProfile.description = _description;
        privateProfile.email = _privateEmail;
        privateProfile.mobile = _mobile;
    }
}
