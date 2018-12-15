pragma solidity ^0.4.24;

/**
 * @title Interface with Foundation.
 */
interface FoundationInterface {
    function foundationContracts(address) external view returns(address);
    function addFoundationAccount(address _account, address _contract) external;
}
