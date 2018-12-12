pragma solidity ^0.4.24;

import './Tokenized.sol';

/**
 * @title Profile contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Profile is Tokenized {

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

    struct PrivateProfile {
        // Private email.
        // SSTORAGE 1 full after this.
        bytes32 email;

        // Mobile number.
        // bytes16 left afther this on SSTORAGE 2.
        bytes16 mobile;
    }
    PrivateProfile private privateProfile;

    /**
     * @dev Constructor.
     */
    constructor(uint8 _partnerCategory, address _token)
        public
        Tokenized(_partnerCategory, _token)
    {
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }

    /**
     * @dev Get private profile.
     */
    function getPrivateProfile()
        external view onlyReader returns (bytes32, bytes16) {
        return (
            privateProfile.email,
            privateProfile.mobile
        );
    }

    /**
     * @dev Set public profile.
     */
    function setPublicProfile(
        bytes32 _name1,
        bytes32 _name2,
        bytes32 _tagline,
        bytes32 _url,
        bytes32 _email,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        string _description
    )
        external onlyOwner
    {
        publicProfile.name1 = _name1;
        publicProfile.name2 = _name2;
        publicProfile.tagline = _tagline;
        publicProfile.url = _url;
        publicProfile.email = _email;
        publicProfile.pictureHash = _pictureHash;
        publicProfile.pictureEngine = _pictureEngine;
        publicProfile.description = _description;
    }

    /**
     * @dev Set private profile.
     */
    function setPrivateProfile(bytes32 _email, bytes16 _mobile) external onlyOwner {
        privateProfile.email = _email;
        privateProfile.mobile = _mobile;
    }
}
