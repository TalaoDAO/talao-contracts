pragma solidity ^0.4.24;

import '../Partner.sol';

/**
 * @title Interface with PartnerInherited1.sol.
 */
interface PartnerInherited1Interface {

    /**
     * @dev Method of PartnerInheritance.sol.
     */
    function r2pGetTest() external view returns (string);
}

/**
 * @title Test to read something from another contract through this contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract PartnerInherited2 is Partner {

    /**
     * @dev Constructor.
     */
    constructor(uint8 _category) public Partner(_category) {
        partnerInformation.category = _category;
    }

    /**
     * @dev Convention:
     * @dev functions that are called by people through their Partner contract
     * @dev start by: a2p (Ask to Partner)
     * @dev They generally should be onlyOwner!
     * @dev The methods called in the Partner contract should be defined in an interface.
     */
    function a2pGetTest(address _partner) external view onlyOwner returns (string) {

        // The source contract from which we want to read.
        PartnerInherited1Interface sourceContract = PartnerInherited1Interface(_partner);

        // Read the source contract and return value to msg.sender.
        return sourceContract.r2pGetTest();
    }
}
