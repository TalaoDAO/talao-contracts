pragma solidity ^0.4.24;

import '../Tokenized.sol';
import '../Documents.sol';

/**
 * @title Independent Documents.sol implementation for tests.
 */
contract DocumentsTest is Tokenized, Documents {

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
