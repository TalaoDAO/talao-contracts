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
    mapping (address=>address) FreelanceVault;

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

    function HasVault (address freelance)
        public
        view
    returns (bool)
    {
        bool result = false;
        address freeAdd = FreelanceVault[freelance];
        if(freeAdd != address(0)) {
            result = true;
        }
        
        return result;
    }

    /*
        this method return vault adress
    */
    function GetVault(address freelance)
        public
        view
    returns(address)
    {
        address freeAdd = address(0);
        uint256 accessPrice;
        address appointedAgent;
        uint sharingPlan;
        uint256 userDeposit;

        (accessPrice, appointedAgent,sharingPlan,userDeposit) = myToken.data(freelance);
        bool isAccess = myToken.hasVaultAccess(freelance,msg.sender);
        bool isPartner = myFreelancer.isPartner(freelance,msg.sender);

        if(accessPrice <= 0 || isAccess || isPartner) {
            freeAdd = FreelanceVault[freelance];
        }
       
        return freeAdd;
    }

    /**
     * Talent can call this method to create a new Vault contract
     *  with the maker being the owner of this new vault
     */
    function CreateVaultContract (uint256 _price, bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description, bytes32 _pic)
        public
        returns(address)
    {
        bool isAccess = myToken.hasVaultAccess(msg.sender,msg.sender);
        require(isAccess == true,"sender hasn't access to vault");

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