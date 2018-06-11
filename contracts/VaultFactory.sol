
pragma solidity ^0.4.21;

import "./Vault.sol";
import "./Talao.sol";

contract VaultFactory is Ownable {
    uint public nbVault;
    TalaoToken myToken;

    //first address is Talent ethereum address 
    //second address is Smart Contract vault address dedicated to this talent
    mapping (address=>address) public FreelanceVault; 

    enum VaultState { AccessDenied, AlreadyExist, Created }
    event VaultCreation(address indexed talent, address vaultadddress, VaultState msg);

    //address du smart contract token
    function VaultFactory(address token) 
        public 
    {
        myToken = TalaoToken(token);
    }

    function getNbVault()
        public
        view
        returns(uint)
    {
        return nbVault;
    }

    /**
     * Talent can call this method to create a new Vault contract
     *  with the maker being the owner of this new vault
     */
    function CreateVaultContract (bytes32 documentId, bytes32 description, bytes32 keyword, uint256 price)
        public
        returns(address)
    {
        //Verify using Talao token if sender is authorized to create a Vault
        bool agreement = false;
        uint unused = 0;
        (agreement, unused) = myToken.accessAllowance(msg.sender,msg.sender);

        require (agreement == true);
        require(FreelanceVault[msg.sender] == address(0));
        require(documentId != 0);
        //myToken.createVaultAccess(price);
        Vault newVault = new Vault(myToken, documentId, description, keyword);
        FreelanceVault[msg.sender] = address(newVault);
        SafeMath.add(nbVault,1);
        newVault.transferOwnership(msg.sender);
        
        emit VaultCreation(msg.sender, newVault, VaultState.Created);

        return address(newVault);
    }

    /**
     * Prevents accidental sending of ether to the factory
     */
    function () 
        public 
    {
        revert();
    }
}