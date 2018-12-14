pragma solidity ^0.4.24;

import './Filebox.sol';
import './Tokenized.sol';
import './Profile.sol';
import './Documents.sol';

/**
 * @title A Workspace contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Workspace is Filebox, Tokenized, Profile, Documents {

    /**
     * @dev Constructor.
     */
    constructor(uint8 _category, address _token)
        public
        Tokenized(_category, _token)
    {
        partnerCategory = _category;
        token = TalaoToken(_token);
    }

    //TODO: kill, ownable + foundation link

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
