pragma solidity ^0.4.24;

import '../Permissions.sol';

/**
 * @title Interface with clones or inherited contracts.
 * //TODO: set profiles + encrypted message
 */
interface ProfileInterface {

    /**
     * @dev Method of Profile.sol.
     */
    function getPublicProfile() external view returns (bytes32);
}

/**
 * @title Profile contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Profile is Permissions {

    struct PublicProfile {
        // Public encryption key.
        // SSTORAGE 1 full.
        bytes32 publicEncryptionKey;

        // TODO: name, url, ...
    }
    PublicProfile public publicProfile;

    struct PrivateProfile {
        // Mobile number.
        // bytes16 left afther this on SSTORAGE 1.
        bytes16 mobile;

        // TODO...
    }
    PrivateProfile privateProfile;

    constructor(uint8 _category, address _token) public Partner(_category) {
        partnerInformation.category = _category;
        token = TalaoToken(_token);
    }

    /**
     * @dev Get public profile.
     */
    function getPublicProfile(address _partner) external view returns (bytes32) {
        return publicProfile.publicEncryptionKey;
    }

    /**
     * @dev Get private profile.
     */
    function getPrivateProfile(address _partner) external view onlyReader returns (bytes16) {
        return privateProfile.mobile;
    }

    /**
     * @dev Get public profile to another Partner contract.
     */
    function toPartner_getPublicProfile(address _partner) external view onlyOwner returns (bytes32) {

        // The source contract from which we want to read.
        ProfileInterface sourceContract = ProfileInterface(_partner);

        // Read the source contract and return value to msg.sender.
        return sourceContract.getPublicProfile();
    }
}
