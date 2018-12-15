pragma solidity ^0.4.24;

import './Foundation.sol';

/**
 * @title Manages ownership through the Foundation contract.
 * @notice See transferOwnershipInFoundation in Foundation.sol.
 * @author Talao, Polynomial.
 */
contract OwnableInFoundation {

    // Interface with Foundation.
    FoundationInterface foundation;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation) public {
        foundation = FoundationInterface(_foundation);
    }

    /**
     * @dev Owner of this contract, in the Foundation sense.
     * @dev We do not allow this to be used externally,
     * @dev since a contract could fake ownership.
     * @dev In other contracts, you have to call the Foundation to
     * @dev know the real owner of this contract.
     */
    function ownerInFoundation() internal view returns (address) {
        return foundation.contractsToAccounts(address(this));
    }

    /**
     * @dev Check in Foundation if msg.sender is the owner of this contract.
     * @dev Same remark.
     */
    function isOwnerInFoundation() internal view returns (bool) {
        return msg.sender == ownerInFoundation();
    }

    /**
     * @dev Modifier version of isOwnerInFoundation.
     */
    modifier onlyOwnerInFoundation() {
        require(
           isOwnerInFoundation(),
           'You are not the owner'
        );
        _;
    }
}
