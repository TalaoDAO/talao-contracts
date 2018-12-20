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
    constructor(address _foundation, uint _partnerCategory, address _token)
        Permissions(_foundation, _partnerCategory, _token)
        public
    {
        foundation = Foundation(_foundation);
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }
}
