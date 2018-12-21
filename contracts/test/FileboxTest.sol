pragma solidity ^0.4.24;

import "../content/Filebox.sol";

/**
 * @title Filebox contract.
 * @notice Contract to "send" and "receive" decentralized encrypted files.
 * @author Talao, Polynomial.
 */
contract FileboxTest is Permissions, Filebox {

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
