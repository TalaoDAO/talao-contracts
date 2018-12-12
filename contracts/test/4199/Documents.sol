pragma solidity ^0.4.24;

import '../../Tokenized.sol';
import '../../Documents.sol';

/**
 * @title Independent Documents.sol implementation for tests.
 */
contract Documents4199 is Tokenized, Documents {

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
