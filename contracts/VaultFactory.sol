pragma solidity ^0.4.23;

import './Vault.sol';
import './Talao.sol';
import './Freelancer.sol';

/**
 * @title VaultFactory
 * @dev This contract is a factory of Vault contracts.
 * @author Slowsense, Talao, Blockchain Partner.
 */
contract VaultFactory is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Number of Vaults.
    uint nbVault;
    // Talao token.
    TalaoToken myToken;
    // Freelancer contract to store freelancers information.
    Freelancer myFreelancer;

    // First address is the freelance Ethereum address.
    // Second address is the freelance's Vault smart contract address.
    mapping (address => address) FreelanceVault;

    enum VaultState { AccessDenied, AlreadyExist, Created }

    // Talao token smart contract address.
    constructor(address token, address freelancer)
        public
    {
        myToken = TalaoToken(token);
        myFreelancer = Freelancer(freelancer);
    }

    /**
     * @dev Get total number of Vaults.
     */
    function getNbVault()
        public
        view
        returns(uint)
    {
        return nbVault;
    }

    /**
     * @dev Getter to see if a freelance has a Vault.
     */
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

    /**
     * @dev Get the freelance's Vault address, if authorized.
     */
    function GetVault(address freelance)
        public
        view
    returns(address)
    {
        //tupple used for data
        uint256 accessPrice;
        address appointedAgent;
        uint sharingPlan;
        uint256 userDeposit;

        (accessPrice, appointedAgent,sharingPlan,userDeposit) = myToken.data(freelance);

        if (accessPrice <= 0) {
            return FreelanceVault[freelance];
        }

        if (msg.sender != address(0)) {
            bool hasAccess = myToken.hasVaultAccess(freelance, msg.sender);
            bool isPartner = myFreelancer.isPartner(freelance, msg.sender);
            bool isAdmin = myFreelancer.isTalaoAdmin(msg.sender);

            if (hasAccess || isPartner || isAdmin) {
                return FreelanceVault[freelance];
            }
        }

        return address(0);
    }

    /**
     * Talent can call this method to create a new Vault contract
     *  with the maker being the owner of this new vault
     */
    function CreateVaultContract (uint256 _price, bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description, bytes32 _pic)
        public
        returns(address)
    {
        bool hasAccess = myToken.hasVaultAccess(msg.sender,msg.sender);
        require(hasAccess, 'Sender has no access to Vault.');

        myFreelancer.UpdateFreelancerData(msg.sender,_firstname,_lastname,_phone,_email,_title,_description,_pic);

        //create vault
        Vault newVault = new Vault(myToken, myFreelancer);

        FreelanceVault[msg.sender] = address(newVault);
        nbVault = nbVault.add(1);
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
