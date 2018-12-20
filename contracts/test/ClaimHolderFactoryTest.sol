pragma solidity ^0.4.24;

import "../identity/ClaimHolder.sol";

contract ClaimHolderFactoryTest is ClaimHolder {

    event NewClaimHolder(address _creator, address _contract);

    function createClaimHolder() external {
        ClaimHolder newClaimHolder = new ClaimHolder();
        emit NewClaimHolder(msg.sender, address(newClaimHolder));
    }
}
