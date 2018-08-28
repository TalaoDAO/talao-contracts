
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

     modifier allowance () { //require sur l'aggreement
        bool agreement = false;
        if(!agreement)
        {
            uint unused = 0;
            (agreement, unused) = myToken.accessAllowance(msg.sender,msg.sender);
            require(agreement == true);
        }
        _;
    }

    /*
        this method return vault adress
    */
    function GetVault(address freelance)
        public
        view
        allowance
    returns(address)
    {
        return this.FreelanceVault(freelance);
    }

    /**
     * Talent can call this method to create a new Vault contract
     *  with the maker being the owner of this new vault
     */
    function CreateVaultContract (uint256 _price, bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description, bytes32 _pic)
        public
        allowance
        returns(address)
    {
        
        myFreelancer.UpdateFreelancerData(msg.sender,_firstname,_lastname,_phone,_email,_title,_description,_pic);
        
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