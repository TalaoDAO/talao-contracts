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

    // Main registry.
    mapping(address => address) public foundationAccountsToContracts;

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
     * @dev Called by a contract to register his owner and himself in Foundation.
     */
    function joinFoundation() external {

        // Interface with the calling contract.
        PartnershipInterface callingContractInterface = PartnershipInterface(msg.sender);

        // Get contract owner.
        address callingContractOwner = callingContractInterface.owner();

        // This is mandatory, otherwise a contract could fake ownership
        // and erase someone's mapping.
        require(
            foundationAccountsToContracts[callingContractOwner] == address(0),
            'Owner address already registered'
        );

        // Register correspondance between account & contract.
        foundationAccountsToContracts[callingContractOwner] = msg.sender;
    }

    /**
     * @dev Called by a user to remove his contract address.
     */
    function leaveFoundation() external {

        require(
            foundationAccountsToContracts[msg.sender] != address(0),
            'Account not registered'
        );

        delete foundationAccountsToContracts[msg.sender];
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
        foundationAccountsToContracts[_accountAddress] = _contractAddress;
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
