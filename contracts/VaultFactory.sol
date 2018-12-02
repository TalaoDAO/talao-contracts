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

    // Vaults status.
    enum VaultStatus { Unregistered, Active, Suspended }

    // An entry of the Vaults registry.
    struct VaultEntry {
        address vaultAddress;
        VaultStatus vaultStatus;
    }

    // Vaults Registry.
    mapping (address => VaultEntry) VaultsRegistry;

    // Total number of active Vaults.
    uint public activeVaultsNumber;

    // Address of the Talao Bot.
    // He can get the Vault addresses, but not the Vaults content.
    address talaoBot;

    /**
     * @dev Constructor.
     */
    constructor(address _token) public {
        myToken = TalaoToken(_token);
    }

    /**
     * @dev Getter to see if someone has an active Vault.
     */
    function hasActiveVault(address _freelancerAddress)
        public
        view
        returns (bool) {
        return VaultsRegistry[_freelancerAddress].vaultStatus == VaultStatus.Active;
    }

    /**
     * @dev Get the Freelancer's Vault address, if authorized.
     */
    function getVault(address _freelancerAddress)
        public
        view
        returns (address) {

        // Get access price of the Vault.
        (uint256 accessPrice,,,) = myToken.data(_freelancerAddress);

        // Free Vault.
        if (accessPrice == 0) {
            return VaultsRegistry[_freelancerAddress].vaultAddress;
        }

        // Vault with access price & authorized access.
        Vault myVault = Vault(VaultsRegistry[_freelancerAddress].vaultAddress);
        if (
            myToken.hasVaultAccess(_freelancerAddress, msg.sender) ||
            myVault.Partners(msg.sender) ||
            isTalaoBot(msg.sender)
        ) {
            return VaultsRegistry[_freelancerAddress].vaultAddress;
        }

        // No authorized access.
        return address(0);
    }

    /**
     * @dev Is an address the Talao Bot?
     */
    function isTalaoBot(address _address) public view returns (bool) {
        return talaoBot == _address;
    }

    /**
     * @dev Freelancer calls this method to create a new Vault contract.
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
        returns (address) {

        // Sender must have access to his Vault in the Token.
        require(
            myToken.hasVaultAccess(msg.sender, msg.sender),
            'Sender has no access to Vault.'
        );

        // Create Vault.
        Vault newVault = new Vault(myToken, address(this));
        // TODO: decide autonomy of Vaults.

        // Add Vault to Vaults Registry.
        VaultEntry storage newVaultEntry = VaultsRegistry[msg.sender];
        newVaultEntry.vaultAddress = address(newVault);
        newVaultEntry.vaultStatus = VaultStatus.Active;
        activeVaultsNumber = activeVaultsNumber.add(1);

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
     * @dev Remove a Vault from the Registry.
     * @dev Data stored in the Vault contract is deleted in the Vault contract.
     */
    function removeMyVault(address _freelancerAddress) public {

        // Storage pointer.
        VaultEntry storage myVaultEntry = VaultsRegistry[_freelancerAddress];

        // Validate.
        require(
            msg.sender == myVaultEntry.vaultAddress,
            'Only this Vault can unregister this Vault.'
        );
        require(
            myVaultEntry.vaultStatus == VaultStatus.Active,
            'Vault must be active.'
        );

        // Remove the Vault from the Registry.
        activeVaultsNumber = activeVaultsNumber.sub(1);
        delete VaultsRegistry[_freelancerAddress];
    }

    /**
     * @dev Suspend a Vault in the Registry.
     * TODO: decide autonomy of Vaults.
     */
    function suspendVault(address _freelancerAddress) public onlyOwner {

        // Storage pointer.
        VaultEntry storage thisVaultEntry = VaultsRegistry[_freelancerAddress];

        // Validate.
        require(thisVaultEntry.vaultStatus == VaultStatus.Active, 'Vault must be active.');

        // Suspend the Vault.
        thisVaultEntry.vaultStatus == VaultStatus.Suspended;
        activeVaultsNumber = activeVaultsNumber.sub(1);
    }

    /**
     * @dev Unsuspend a Vault in the Registry.
     */
    function unsuspendVault(address _freelancerAddress) public onlyOwner {

        // Storage pointer.
        VaultEntry storage thisVaultEntry = VaultsRegistry[_freelancerAddress];

        // Validate.
        require(
            thisVaultEntry.vaultStatus == VaultStatus.Suspended,
            'Vault must be suspended.'
        );

        // Unsuspend the Vault.
        thisVaultEntry.vaultStatus == VaultStatus.Active;
        activeVaultsNumber = activeVaultsNumber.add(1);
    }

    /**
     * @dev Set the Talao Bot Ethereum address.
     * He can get the Vault addresses of the Freelancers, but not the Vaults content.
     */
    function setTalaoBot(address _talaobotAddress) public onlyOwner {
        talaoBot = _talaobotAddress;
    }

    /**
     * Prevents accidental sending of ether to the factory.
     */
    function() public {
        revert();
    }
}
