pragma solidity ^0.4.24;

import "../access/Permissions.sol";
import "../content/Profile.sol";

/**
 * @title Independent Profile.sol implementation for tests.
 */
contract ProfileTest is Permissions, Profile {

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, address _token, uint _partnerCategory)
        Permissions(_foundation, _token, _partnerCategory)
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        partnerCategory = _partnerCategory;
    }
}
