pragma solidity ^0.4.24;

import './Filebox.sol';
import './Tokenized.sol';
import './Profile.sol';
import './Documents.sol';

/**
 * @title A Workspace contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Workspace is Tokenized, Profile, Documents, Filebox {

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

    // TODO: kill

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
