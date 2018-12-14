pragma solidity ^0.4.24;

import './Filebox.sol';
import './Tokenized.sol';
import './Profile.sol';
import './Documents.sol';

/**
 * @title Foundation contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Foundation is Filebox, Tokenized, Profile, Documents {

    // Account addresses => contract addresses.
    mapping(address => address) public accountsToContracts;

    /**
     * @dev Constructor.
     */
    constructor(address _token)
        public
        Tokenized(1, _token)
    {
        partnerCategory = 1;
        token = TalaoToken(_token);
    }

    /**
     * @dev Called by a user to register his contract address.
     */
    function joinFoundation(address _contractAddress) external {
        accountsToContracts[msg.sender] = _contractAddress;
    }

    /**
     * @dev Called by a user to remove his contract address.
     */
    function leaveFoundation() external {

        require(
            accountsToContracts[msg.sender] != address(0),
            'Account not registered'
        );

        delete accountsToContracts[msg.sender];
    }

    /**
     * @dev Manually set account => contract for Foundation owner.
     */
    function setFoundationAccountToContract(
        address _accountAddress,
        address _contractAddress
    )
        external
        onlyOwner
    {
        accountsToContracts[_accountAddress] = _contractAddress;
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
