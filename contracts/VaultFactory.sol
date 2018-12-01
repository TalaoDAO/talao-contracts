pragma solidity ^0.4.24;

import './Talao.sol';
import './Vault.sol';

/**
 * @title VaultFactory
 * @notice This contract is a factory of Vault contracts.
 * @author Talao, Slowsense, Blockchain Partner.
 */
contract VaultFactory is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Talao token.
    TalaoToken myToken;

    // Vaults Registry.
    enum FreelancerStatus { Unregistered, Active, Blocked }
    struct VaultsRegistryEntry {
        address vaultAddress;
        FreelancerStatus status;
    }
    mapping (address => VaultsRegistryEntry) VaultsRegistry;
    uint public vaultsNumber;

    // Address of the Talao Bot. He can get the Vault addresses of the Freelancers, but not the Vaults content.
    address TalaoBot;

    /**
     * @dev Constructor.
     */
    constructor(address _token)
        public
    {
        myToken = TalaoToken(_token);
    }

    /**
     * @dev Getter to see if someone has a validated Vault.
     */
    function hasValidatedVault(address _address)
        public
        view
        returns (bool hasVault) {
        if (VaultsRegistry[_address].status == FreelancerStatus.Active) {
            hasVault = true;
        }
    }

    /**
     * @dev Get the Freelancer's Vault address, if authorized.
     */
    function getVault(address _address)
        public
        view
        returns (address)
    {
        (uint256 accessPrice,,,) = myToken.data(_address);

        // Memory pointer.

        // Free Vaults.
        if (accessPrice == 0) {
            return VaultsRegistry[_address].vaultAddress;
        }

        // Vaults with access price, authorized access.
        Vault myVault = Vault(VaultsRegistry[_address].vaultAddress);
        if (
            myToken.hasVaultAccess(_address, msg.sender) ||
            myVault.Partners(msg.sender) ||
            isTalaoBot(msg.sender)
        ) {
            return VaultsRegistry[_address].vaultAddress;
        }

        // No authorized access.
        return address(0);
    }

    /**
     * @dev Is an address the Talao Bot?
     */
    function isTalaoBot(address _address)
        public
        view
        returns (bool talaoBot)
    {
        if (TalaoBot == _address) {
            talaoBot = true;
        }
    }

    /**
     * @dev Talent can call this method to create a new Vault contract with the maker being the owner of this new Vault.
     */
    function createVaultContract (
        bytes16 _firstName,
        bytes16 _lastName,
        bytes16 _phone,
        bytes16 _email,
        bytes32 _jobTitle,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        bytes30 _additionalData,
        string _description
    )
        public
        returns (address)
    {
        // Sender must have access to his Vault in the Token.
        require(myToken.hasVaultAccess(msg.sender, msg.sender), 'Sender has no access to Vault.');

        // Create Vault.
        Vault newVault = new Vault(myToken, address(this));

        // Add Vault to Vaults Registry.
        VaultsRegistryEntry storage newVaultRegistryEntry = VaultsRegistry[msg.sender];
        newVaultRegistryEntry.vaultAddress = address(newVault);
        newVaultRegistryEntry.status = FreelancerStatus.Active;
        vaultsNumber = vaultsNumber.add(1);

        // Create Freelancer's Profile in his Vault.
        newVault.createProfile(
            _firstName,
            _lastName,
            _phone,
            _email,
            _jobTitle,
            _pictureHash,
            _pictureEngine,
            _additionalData,
            _description
        );

        // Transfer Vault to Freelancer.
        newVault.transferOwnership(msg.sender);

        // Return new Vault address.
        return address(newVault);
    }

    /**
     * @dev Unregister a Vault from the Registry.
     * @dev Data stored in the Vault contract is deleted in the Vault contract.
     */
    function unregisterVault(address _freelancer_address) public {
        // Storage pointer.
        VaultsRegistryEntry storage myVaultRegistryEntry = VaultsRegistry[_freelancer_address];

        // Validate.
        require(msg.sender == myVaultRegistryEntry.vaultAddress, 'Only this Vault can unregister this Vault.');
        require(myVaultRegistryEntry.status == FreelancerStatus.Active, 'Freelancer must be active.');

        // Remove the Vault from the Registry.
        delete myVaultRegistryEntry.vaultAddress;
        delete myVaultRegistryEntry.status;
        vaultsNumber = vaultsNumber.sub(1);
    }

    /**
     * @dev Get the Talao Bot address.
     */
    function getTalaoBot()
        public
        onlyOwner
        view
        returns (address)
    {
        return TalaoBot;
    }

    /**
     * @dev Set the Talao Bot Ethereum address.
     * He can get the Vault addresses of the Freelancers, but not the Vaults content.
     */
    function setTalaoBot(address _talaobot)
        public
        onlyOwner
    {
        TalaoBot = _talaobot;
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
