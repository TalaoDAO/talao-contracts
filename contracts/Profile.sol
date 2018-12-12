pragma solidity ^0.4.24;

import './TokenizedPartner.sol';

/**
 * @title Profile contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Profile is TokenizedPartner {

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

    constructor(uint8 _partnerCategory, address _token) public {
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }

    /**
     * @dev Get public profile.
     */
    function getPublicProfile() external view returns (bytes32) {
        return publicProfile.publicEncryptionKey;
    }

    /**
     * @dev Get private profile.
     */
    function getPrivateProfile() external view onlyReader returns (bytes16) {
        return privateProfile.mobile;
    }

    /**
     * @dev Methods used to call Partner contracts through this contract.
     */

    /**
     * @dev Get public profile from another Partner contract.
     */
    function owner_getPublicProfile(address _partner) external view onlyOwner returns (bytes32) {

        // The source contract from which we want to read.
        ProfileInterface sourceContract = ProfileInterface(_partner);

        // Read the source contract and return value to msg.sender.
        return sourceContract.getPublicProfile();
    }
}

/**
 * @title Interface with clones or inherited contracts.
 */
interface ProfileInterface {
    function getPublicProfile() external view returns (bytes32);
}
