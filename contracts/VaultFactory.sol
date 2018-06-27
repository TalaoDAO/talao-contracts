
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
    function CreateVaultContract ()
        public
        returns(address)
    {
        //TODO We have to delegate the call to pass the original msg.sender
        //address(myToken).delegatecall(bytes4(keccak256("createVaultAccess(uint256)")), price);

        //Verify using Talao token if sender is authorized to create a Vault
        bool agreement = false;
        uint unused = 0;
        (agreement, unused) = myToken.accessAllowance(msg.sender,msg.sender);

        require (agreement == true);
        require(FreelanceVault[msg.sender] == address(0));
        Vault newVault = new Vault(myToken, myFreelancer);

        //TODO, just like the createVaultAccess function, we should use delegatecall to keep the msg.sender in order to add document 
        //address(newVault).delegatecall(bytes4(keccak256("addDocument(bytes32, bytes32, bytes32[], uint, uint, uint, bool)")), documentId, description, keywords, documentType, startDate, endDate, isBlockCert);
        
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