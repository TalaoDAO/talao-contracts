pragma solidity ^0.4.24;

import "./ownership/Ownable.sol";

/**
 * @title Foundation contract.
 * @author Talao, Polynomial.
 */
contract Foundation is Ownable {

    // Registered foundation factories.
    mapping(address => bool) public factories;

    // Owners (EOA) to contract addresses relationships.
    mapping(address => address) public ownersToContracts;

    // Contract addresses to owners relationships.
    mapping(address => address) public contractsToOwners;

    // Index of known contract addresses.
    address[] private contractsIndex;

    // Members (EOA) to contract addresses relationships.
    // In a Partnership.sol inherited contract, this allows us to create a
    // modifier for most read functions in this contract that will authorize
    // any account associated with an authorized Partnership contract.
    mapping(address => address) public membersToContracts;

    // Index of known members for each contract.
    // These are EOAs that were added once, even if removed now.
    mapping(address => address[]) public contractsToKnownMembersIndexes;

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
            contractsToOwners[_contract] == address(0),
            'Contract already has owner'
        );
        require(
            ownersToContracts[_account] == address(0),
            'Account already has contract'
        );
        contractsToOwners[_contract] = _account;
        contractsIndex.push(_contract);
        ownersToContracts[_account] = _contract;
        membersToContracts[_account] = _contract;
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
                ownersToContracts[msg.sender] == _contract &&
                contractsToOwners[_contract] == msg.sender
            ),
            'You are not the owner'
        );
        ownersToContracts[msg.sender] = address(0);
        membersToContracts[msg.sender] = address(0);
        ownersToContracts[_newAccount] = _contract;
        membersToContracts[_newAccount] = _contract;
        contractsToOwners[_contract] = _newAccount;
        // Remark: we do not update the contracts members.
        // It's the new owner's responsability to remove members, if needed.
    }

    /**
     * @dev Allows the current owner to relinquish control of the contract.
     * This is called through the contract.
     */
    function renounceOwnershipInFoundation() external returns (bool success) {
        // Remove members.
        delete(contractsToKnownMembersIndexes[msg.sender]);
        // Free the EOA, so he can become owner of a new contract.
        delete(ownersToContracts[contractsToOwners[msg.sender]]);
        // Assign the contract to no one.
        delete(contractsToOwners[msg.sender]);
        // Return.
        success = true;
    }

    /**
     * @dev Add a member EOA to a contract.
     */
    function addMember(address _member) external {
        require(
            ownersToContracts[msg.sender] != address(0),
            'You own no contract'
        );
        require(
            membersToContracts[_member] == address(0),
            'Address is already member of a contract'
        );
        membersToContracts[_member] = ownersToContracts[msg.sender];
        contractsToKnownMembersIndexes[ownersToContracts[msg.sender]].push(_member);
    }

    /**
     * @dev Remove a member EOA to a contract.
     */
    function removeMember(address _member) external {
        require(
            ownersToContracts[msg.sender] != address(0),
            'You own no contract'
        );
        require(
            membersToContracts[_member] == ownersToContracts[msg.sender],
            'Address is not member of this contract'
        );
        membersToContracts[_member] = address(0);
        contractsToKnownMembersIndexes[ownersToContracts[msg.sender]].push(_member);
    }

    /**
     * @dev Getter for contractsIndex.
     * The automatic getter can not return array.
     */
    function getContractsIndex()
        onlyOwner
        external
        view
        returns (address[])
    {
        return contractsIndex;
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
