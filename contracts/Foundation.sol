pragma solidity ^0.4.24;

import './ownership/Ownable.sol';

/**
 * @title Foundation contract.
 * @author Talao, Polynomial.
 */
contract Foundation is Ownable {

    // Registered foundation factories.
    mapping(address => bool) public foundationFactories;

    // Registered accounts to contracts relationships.
    mapping(address => address) public foundationAccounts;

    // Registered contracts to accounts relationships.
    mapping(address => address) public foundationContracts;

    // Events for factories.
    event FoundationFactoryAdded(address _factory);
    event FoundationFactoryRemoved(address _factory);

    /**
     * @dev Add a factory.
     */
    function addFoundationFactory(address _factory) external onlyOwner {

        foundationFactories[_factory] = true;
        emit FoundationFactoryAdded(_factory);
    }

    /**
     * @dev Remove a factory.
     */
    function removeFoundationFactory(address _factory) external onlyOwner {

        foundationFactories[_factory] = false;
        emit FoundationFactoryRemoved(_factory);
    }

    /**
     * @dev Modifier for factories.
     */
    modifier onlyFoundationFactory() {

        require(
            foundationFactories[msg.sender],
            'Sender is not a registered factory'
        );

        _;

    }

    /**
     * @dev Add a new account => contract.
     */
    function addFoundationAccount(
        address _account,
        address _contract
    )
        external
        onlyFoundationFactory
    {

        require(
            foundationAccounts[_account] == address(0),
            'Account already has contract'
        );

        require(
            foundationContracts[_contract] == address(0),
            'Contract already has account'
        );

        foundationAccounts[_account] = _contract;
        foundationContracts[_contract] = _account;
    }

    /**
     * @dev Transfer a contract to another account.
     */
    function transferOwnershipInFoundation(
        address _contract,
        address _newOwner
    )
        external
    {

        require(
            (
                foundationAccounts[msg.sender] == _contract &&
                foundationContracts[_contract] == msg.sender
            ),
            'Foundation says you are not the owner'
        );

        foundationAccounts[msg.sender] = address(0);
        foundationAccounts[_newOwner] = _contract;
        foundationContracts[_contract] = _newOwner;
    }

    /**
     * @dev Manually set account => contract for Foundation owner.
     * // TODO: keep? it allows override of ownership by Talao...
     */
    function setFoundationAccount(
        address _account,
        address _contract
    )
        external
        onlyOwner
    {

        foundationAccounts[_account] = _contract;
        foundationContracts[_contract] = _account;
    }
}
