pragma solidity ^0.4.24;

import "./access/Permissions.sol";
import "./content/Profile.sol";
import "./content/Documents.sol";
import "./content/Filebox.sol";

/**
 * @title A Workspace contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Workspace is Permissions, Profile, Documents, Filebox {

    // Creator factory address.
    address public creator;

    /**
     * @dev Constructor.
     */
    constructor(
        address _foundation,
        address _token,
        uint _partnerCategory,
        bytes32 _name1,
        bytes32 _name2,
        bytes32 _tagline,
        bytes32 _url,
        bytes32 _publicEmail,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        string _description
    )
        Permissions(_foundation, _token, _partnerCategory)
        public
    {
        creator = msg.sender;
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        partnerCategory = _partnerCategory;
        publicProfile.name1 = _name1;
        publicProfile.name2 = _name2;
        publicProfile.tagline = _tagline;
        publicProfile.url = _url;
        publicProfile.email = _publicEmail;
        publicProfile.pictureHash = _pictureHash;
        publicProfile.pictureEngine = _pictureEngine;
        publicProfile.description = _description;
    }

    // TODO: kill

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
