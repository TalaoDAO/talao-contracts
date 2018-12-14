pragma solidity ^0.4.24;

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
     * @dev Check in Foundation if msg.sender is the owner of this contract.
     */
    function isOwnerInFoundation() public view returns (bool) {
        return foundation.foundationContracts(address(this)) == msg.sender;
    }

    /**
     * @dev Modifier version of isOwnerInFoundation.
     */
    modifier onlyOwnerInFoundation() {
        require(
           isOwnerInFoundation(),
           'Foundation says you are not the owner'
        );
        _;
    }
}

/**
 * @dev Interface with Foundation.
 */
interface FoundationInterface {
    function foundationContracts(address) external view returns(address);
}