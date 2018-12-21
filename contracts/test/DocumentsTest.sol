pragma solidity ^0.4.24;

import "../access/Permissions.sol";
import "../content/Documents.sol";

/**
 * @title Independent Documents.sol implementation for tests.
 */
contract DocumentsTest is Permissions, Documents {

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
