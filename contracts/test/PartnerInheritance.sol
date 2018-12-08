pragma solidity ^0.4.24;

import '../Partner.sol';
/**
 * @title Test if contracts that inherit from Partner work fine together.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract PartnerInheritance is Partner {

    uint public randomVariable = 123456789;
    uint public variableFromConstructor;

    /**
     * @dev Constructor.
     */
    constructor
    (
        uint8 _category,
        uint _variableForThisContractConstructor
    )
        public
        Partner(_category)
    {
        partnerProfile.category = _category;
        variableFromConstructor = _variableForThisContractConstructor;
    }

    /**
     * @dev Random function.
     * We do not care about overflows, it's just a test.
     */
    function randomFunction(uint _value) public view returns (uint result) {
        result = randomVariable + _value;
    }
}
