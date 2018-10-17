pragma solidity ^0.4.24;

import './Vault.sol';
import './Talao.sol';
import './Freelancer.sol';

/**
 * @title VaultFactory
 * @dev This contract is a factory of Vault contracts.
 * @author Talao, Slowsense, Blockchain Partner.
 */
contract VaultFactory is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Number of Vaults.
    uint public vaultsNb;
    // Talao token.
    TalaoToken myToken;
    // Freelancer contract to store freelancers information.
    Freelancer myFreelancer;

    // First address is the freelance Ethereum address.
    // Second address is the freelance's Vault smart contract address.
    mapping (address => address) FreelancesVaults;

    enum VaultState { AccessDenied, AlreadyExist, Created }

    // Talao token smart contract address.
    constructor(address _token, address _freelancer)
        public
    {
        myToken = TalaoToken(_token);
        myFreelancer = Freelancer(_freelancer);
    }

    /**
     * @dev Getter to see if a freelance has a Vault.
     */
    function hasVault (address _freelance)
        public
        view
        returns (bool hasvault)
    {
        address freelanceVault = FreelancesVaults[_freelance];
        if(freelanceVault != address(0)) {
            hasvault = true;
        }
    }

    /**
     * @dev Get the freelance's Vault address, if authorized.
     */
    function getVault(address freelance)
        public
        view
        returns (address)
    {
        // Tupple used for data.
        uint256 accessPrice;
        address appointedAgent;
        uint sharingPlan;
        uint256 userDeposit;

        (accessPrice, appointedAgent, sharingPlan, userDeposit) = myToken.data(freelance);

        if (accessPrice <= 0) {
            return FreelancesVaults[freelance];
        }

        if (msg.sender != address(0)) {
            bool hasAccess = myToken.hasVaultAccess(freelance, msg.sender);
            bool isPartner = myFreelancer.isPartner(freelance, msg.sender);
            bool isTalaoBot = myFreelancer.isTalaoBot(msg.sender);

            if (hasAccess || isPartner || isTalaoBot) {
                return FreelancesVaults[freelance];
            }
        }

        return address(0);
    }

    /**
     * @dev Talent can call this method to create a new Vault contract with the maker being the owner of this new Vault.
     */
    function createVaultContract (
        bytes32 _firstname,
        bytes32 _lastname,
        bytes32 _mobile,
        bytes32 _email,
        bytes32 _title,
        string _description,
        bytes32 _picture
    )
        public
        returns (address)
    {
        // Sender must have access to his Vault in the Token.
        require(myToken.hasVaultAccess(msg.sender, msg.sender), 'Sender has no access to Vault.');

        // Set Freelancer information.
        myFreelancer.setFreelancer(msg.sender, _firstname, _lastname, _mobile, _email, _title, _description, _picture);
        // Create Vault.
        Vault newVault = new Vault(myToken, myFreelancer);
        // Index Vault.
        FreelancesVaults[msg.sender] = address(newVault);
        // Transfer Vault to Freelancer.
        newVault.transferOwnership(msg.sender);
        // Increment total number of Vaults.
        vaultsNb = vaultsNb.add(1);

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
