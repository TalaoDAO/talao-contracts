pragma solidity ^0.4.24;

import "../access/Permissions.sol";

/**
 * @title Profile contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Profile is Permissions {

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
     * @dev Set private profile.
     */
    function setPrivateProfile(
        bytes _privateEmail,
        bytes _mobile
    )
        external
        onlyIdentityPurpose(20002)
    {
        privateProfile.email = _privateEmail;
        privateProfile.mobile = _mobile;
    }
}
