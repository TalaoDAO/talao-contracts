pragma solidity ^0.4.24;

import './Workspace.sol';

/**
 * @title Foundation contract.
 * @author Talao, Polynomial.
 */
contract Foundation is Workspace {

    // Registered foundation factories.
    mapping(address => bool) public foundationFactories;

    // Registered accounts to contracts relationships.
    mapping(address => address) public foundationAccounts;

    // Events for factories.
    event FoundationFactoryAdded(address _factory);
    event FoundationFactoryRemoved(address _factory);

    /**
     * @dev Constructor.
     */
    constructor(address _token)
        public
        Workspace(1, _token)
    {
        partnerCategory = 1;
        token = TalaoToken(_token);
    }

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
     * @dev Add a new account.
     * @dev All Ethereum user accounts have an associated contract in Foundation.
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
        foundationAccounts[_account] = _contract;
    }

    // TODO: update

    /**
     * @dev Manually set account => contract for Foundation owner.
     */
    function setFoundationAccount(
        address _account,
        address _contract
    )
        external
        onlyOwner
    {
        foundationAccounts[_account] = _contract;
    }
}
