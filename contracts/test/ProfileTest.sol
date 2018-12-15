pragma solidity ^0.4.24;

import '../Tokenized.sol';
import '../Profile.sol';

/**
 * @title Independent Profile.sol implementation for tests.
 */
contract ProfileTest is Tokenized, Profile {

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, uint8 _partnerCategory, address _token)
        Tokenized(_foundation, _partnerCategory, _token)
        public
    {
        foundation = FoundationInterface(_foundation);
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }
}
