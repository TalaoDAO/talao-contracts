pragma solidity ^0.4.24;

import './Filebox.sol';
import './Tokenized.sol';
import './Profile.sol';
import './Documents.sol';

/**
 * @title A Freelancer contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Freelancer is Filebox, Tokenized, Profile, Documents {

    /**
     * @dev Constructor.
     */
    constructor(address _token)
        public
        Tokenized(1, _token)
    {
        partnerCategory = 1;
        token = TalaoToken(_token);
    }
}
