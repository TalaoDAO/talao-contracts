pragma solidity ^0.4.24;

import '../OwnableInFoundation.sol';

/**
 * @title Test onlyOwnerInFoundation in an inherited contract.
 * @author Talao, Polynomial.
 */
contract OwnableInFoundationTest is OwnableInFoundation {

    string secret = "This is sort of a secret string";

    constructor(address _foundation)
        OwnableInFoundation(_foundation)
        public
    {
        foundation = FoundationInterface(_foundation);
    }

    function getSecret() external view onlyOwnerInFoundation returns (string) {
        return secret;
    }
}
