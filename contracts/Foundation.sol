pragma solidity ^0.4.24;

import './ownership/Ownable.sol';

/**
 * @title Foundation contract.
 * @author Talao, Polynomial.
 */
contract Foundation is Ownable {

    // Registered foundation factories.
    mapping(address => bool) public factories;

    // Registered accounts to contracts relationships.
    mapping(address => address) public accountsToContracts;

    // Registered contracts to accounts relationships.
    mapping(address => address) public contractsToAccounts;

    // Events for factories.
    event FactoryAdded(address _factory);
    event FactoryRemoved(address _factory);

    /**
     * @dev Add a factory.
     */
    function addFactory(address _factory) external onlyOwner {
        factories[_factory] = true;
        emit FactoryAdded(_factory);
    }

    /**
     * @dev Remove a factory.
     */
    function removeFactory(address _factory) external onlyOwner {
        factories[_factory] = false;
        emit FactoryRemoved(_factory);
    }

    /**
     * @dev Modifier for factories.
     */
    modifier onlyFactory() {
        require(
            factories[msg.sender],
            'You are not a factory'
        );
        _;
    }

    /**
     * @dev Set initial owner of a contract.
     */
    function setInitialOwnerInFoundation(
        address _contract,
        address _account
    )
        external
        onlyFactory
    {
        require(
            contractsToAccounts[_contract] == address(0),
            'Contract already has owner'
        );
        require(
            accountsToContracts[_account] == address(0),
            'Account already has contract'
        );
        contractsToAccounts[_contract] = _account;
        accountsToContracts[_account] = _contract;
    }

    /**
     * @dev Transfer a contract to another account.
     */
    function transferOwnershipInFoundation(
        address _contract,
        address _newAccount
    )
        external
    {
        require(
            (
                accountsToContracts[msg.sender] == _contract &&
                contractsToAccounts[_contract] == msg.sender
            ),
            'You are not the owner'
        );

        accountsToContracts[msg.sender] = address(0);
        accountsToContracts[_newAccount] = _contract;
        contractsToAccounts[_contract] = _newAccount;
    }

    /**
     * @dev Manually set account => contract for Foundation owner.
     */
    // TODO: remove? it allows override of ownership by Talao...
    function setOwnershipInFoundation(
        address _contract,
        address _account
    )
        external
        onlyOwner
    {
        contractsToAccounts[_contract] = _account;
        accountsToContracts[_account] = _contract;
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}


/**
 * @title Foundation Interface (only functions used in other contracts).
 */
interface FoundationInterface {
    function accountsToContracts(address) external view returns(address);
    function contractsToAccounts(address) external view returns(address);
    function setInitialOwnerInFoundation(
        address _contract,
        address _account
    )
    external;
}
