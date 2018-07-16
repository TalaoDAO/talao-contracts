
pragma solidity ^0.4.23;

import "./Vault.sol";
import "./Talao.sol";
import "./Freelancer.sol";

contract VaultFactory is Ownable {
    uint public nbVault;
    TalaoToken myToken;
    Freelancer myFreelancer;

    //first address is Talent ethereum address 
    //second address is Smart Contract vault address dedicated to this talent
    mapping (address=>address) public FreelanceVault;

    enum VaultState { AccessDenied, AlreadyExist, Created }
    event VaultCreation(address indexed talent, address vaultaddress, VaultState msg);

    //address du smart contract token
    constructor(address token, address freelancer) 
        public 
    {
        myToken = TalaoToken(token);
        myFreelancer = Freelancer(freelancer);
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
    function CreateVaultContract (uint256 _price, bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description)
        public
        returns(address)
    {
        // TODO We have to delegate the call to pass the original msg.sender
        // 3 ways to do that: delegate call, tx.origin, pass the msg.sender in parameter
        //myToken.createVaultAccess(msg.sender, 5);
        
        //address(myToken).delegatecall(bytes4(keccak256("createVaultAccess(uint256)")), 5);

        //Verify using Talao token if sender is authorized to create a Vault
        // bool agreement = false;
        // uint unused = 0;

        //require(FreelanceVault[msg.sender] == address(0),"Freelance has an existing vault");
        
        //create vaultAccess
        //myToken.createVaultAccess(_price);
        //create Freelancer data
        myFreelancer.UpdateFreelancerData(_firstname,_lastname,_phone,_email,_title,_description);
        //create vault
        Vault newVault = new Vault(myToken, myFreelancer);
        
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