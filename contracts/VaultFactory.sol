pragma solidity ^0.4.21;

import "./Vault.sol";
//import "./MainContracts.sol";
import "./TestContract.sol";

contract VaultFactory is Ownable {
    uint public nbVault;
    TalaoToken myToken;

    //first address is Talent ethereum address 
    //second address is Smart Contract vault address dedicated to this talent
    mapping (address=>address) public FreelanceVault; 

    // enum VaultState { AccessDenied, AlreadyExist, Created }

    // event VaultCreation(address indexed talent, address vaultadddress, VaultState msg);

    //address du smart contract token
    function VaultFactory(address token) 
    public 
    {
        myToken = TalaoToken(token);
    }

    function getMyToken()
    public
    returns(address)
    {
        return myToken;
    }

    /**
     * Talent can call this method to create a new Vault contract
     *  with the maker being the owner of this new vault
     */
    function CreateVaultContract ()
    public
    returns(address)
    {
        //Verify using Talao token if sender is authorized to create a Vault
        bool agreement = false;
        uint unused = 0;
        (agreement, unused) = myToken.AccessAllowance(msg.sender,msg.sender);

        require (agreement == true);
        require(FreelanceVault[msg.sender] != address(0));

        Vault newVault = new Vault(myToken);
        FreelanceVault[msg.sender] = address(newVault);
        SafeMath.add(nbVault,1); //nbVault++; //utiliser safe math
        newVault.transferOwnership(msg.sender);
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