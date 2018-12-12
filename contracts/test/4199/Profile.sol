pragma solidity ^0.4.24;

import '../../Tokenized.sol';
import '../../Profile.sol';

/**
 * @title Independent Profile.sol implementation for tests.
 */
contract Profile4199 is Tokenized, Profile {

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
}
