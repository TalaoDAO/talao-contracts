pragma solidity ^0.4.24;

import './Partnership.sol';
import './Profile.sol';
import './Documents.sol';
import './Filebox.sol';

/**
 * @title A Freelancer contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Freelancer is Filebox, Partnership, Profile, Documents {

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
