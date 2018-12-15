pragma solidity ^0.4.24;

import './Tokenized.sol';
import './Profile.sol';
import './Documents.sol';
import './Filebox.sol';

/**
 * @title A Workspace contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Workspace is Tokenized, Profile, Documents, Filebox {

    /**
     * @dev Constructor.
     */
    constructor(
        address _foundation,
        uint _partnerCategory,
        address _token,
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
        Tokenized(_foundation, _partnerCategory, _token)
        public
    {
        foundation = FoundationInterface(_foundation);
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
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

    // TODO: kill

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
