pragma solidity ^0.4.24;

import '../Filebox.sol';

/**
 * @title Filebox contract.
 * @notice Contract to "send" and "receive" decentralized encrypted files.
 * @author Talao, Polynomial.
 */
contract FileboxTest is Filebox {

    // Interface with Foundation.
    FoundationInterface foundation;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation)
        OwnableInFoundation(_foundation)
        public
    {
        foundation = FoundationInterface(_foundation);
    }
}
