pragma solidity ^0.4.24;

contract FoundationOwnable {

    // Interface with Foundation.
    FoundationInterface foundation;

    constructor(address _fondation) public {
        foundation = FoundationInterface(_foundation);
    }

    /**
     * @dev Check in Foundation if msg.sender is the owner of the contract.
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
    }
}
