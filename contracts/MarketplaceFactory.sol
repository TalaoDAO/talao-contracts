pragma solidity ^0.4.24;

import './TalaoContract.sol';
import './Talao.sol';
import './Vault.sol';

/**
 * @title Marketplace.
 * @notice This contract manages a Vaults registry and generates Vaults.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 * @dev Vaults can be deployed independently with custom code,
 * @dev while interoperating with Marketplaces,
 * @dev as long as they implement at least the same methods as Vault.sol.
 */
contract Marketplace is TalaoContract {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Marketplace settings struct.
    struct MarketplaceSettings {
      // Name of the Marketplace.
      bytes32 name;

      // Address with privileges for common Marketplace and validated Vaults ops.
      // Different than the owner, for security reasons.
      // Can be set.
      address operator;

      // URL of the Marketplace.
      bytes12 url;
    }
    // Settings of this Marketplace.
    MarketplaceSettings public marketPlaceSettings;

    // Struct for one Freelancer Vault entry.
    struct KnownVault {
        // Address of the Vault contract.
        // bytes12 left after this.
        address vaultAddress;

        // Status: 0 = unknown, 1 = validated, 2 = pending approval.
        // Other values: could be used in the future.
        // bytes11 left after this.
        uint8 status;

        // Key in pending Freelancers index or validated Freelancers index.
        // bytes7 left after this.
        uint32 indexKey;

        // Bytes7 to fill the SSTORAGE n°1.
        // Could be used in the future for categorization.
        // Either directly with the bytes7,
        // or by using serialized data bytes7,
        // and implementing deserialization in the contract.
        bytes7 other;
    }

    // Known Vaults.
    // Mapping Freelancer address => KnownVault struct.
    mapping (address => KnownVault) public KnownVaults;

    // Index of pending Freelancers.
    address[] pendingFreelancers;

    // Index of validated Freelancers.
    address[] validatedFreelancers;

    /**
     * @dev Constructor.
     */
    constructor(address _token) public {
        token = TalaoToken(_token);
    }

    /**
     * @dev Register a Vault.
     * @dev Called by a Vault contract only.
     */
    function registerVault() external {

        // Get Vault owner.
        Vault memory thisVault = Vault(msg.sender);
        address vaultOwner = thisVault.owner;

        // Register Vault.
        _registerVault(vaultOwner, msg.sender);

        // We don't want to emit an event.
        // Indeed they would give the list of the freelancers.
        // So we use pendingFreelancers index.
        // Marketplace interface has to call this index regularly.
    }

    /**
     * @dev Unregister a Vault.
     * @dev Called by a Vault contract only.
     */
    function unregisterVault() external {

        // Get Vault owner.
        Vault memory thisVault = Vault(msg.sender);
        address vaultOwner = thisVault.owner;

        // Unregister Vault.
        _unregisterVault(vaultOwner, msg.sender);
    }

    /**
     * @dev Validate Vault.
     */
    function validateVault(_freelancerAddress) public onlyOwner {
        // Storage pointer.
        KnownVault storage thisVault = KnownVaults[_freelancerAddress];

        // Vault must be registered.
        require(
            thisVault.vaultAddress =! address(0),
            'This Vault is not registered.'
        );

        // Validate Vault.
        KnownVaults[_freelancerAddress].validated = true;

        // Add to Vault index.
        thisVault.freelancersKey = uint32(freelancersIndex.push(_vaultOwner).sub(1));
    }

    /**
     * @dev Unvalidate Vault.
     */
    function unvalidateVault(_freelancerAddress) external onlyOwner {
        KnownVaults[_freelancerAddress].validated = true;
    }

    /**
     * @dev Internal function to register a Vault.
     */
    function _registerVault(address _vaultOwner, address _vaultAddress) internal {

        // Storage pointer.
        KnownVault storage thisVault = KnownVaults[_vaultOwner];

        // Vault must not be already known.
        require(
            thisVault.vaultAddress == address(0),
            'A Vault is already known for this Freelancer.'
        );

        // Owner of the Vault contract must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(_vaultOwner, _vaultOwner),
            'Freelancer has no Vault access in the Talao token.'
        );

        // Add to Vaults Registry.
        thisVault.vaultAddress = _vaultAddress;
    }

    /**
     * @dev Internal function to unregister a Vault.
     */
    function _unregisterVault(address _vaultOwner, address _vaultAddress) internal {

        // Storage pointer.
        KnownVault storage vaultToUnregister = KnownVaults[_vaultOwner];

        // Vault must be registered.
        require(
            vaultToUnregister.vaultAddress == _vaultAddress,
            'No Vault is registered for this Freelancer.'
        );

        // Owner of the Vault contract must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(_vaultOwner, _vaultOwner),
            'Freelancer has no Vault access in the Talao token.'
        );

        // If the owner of the Vault to remove is not the last in the index,
        if (vaultToUnregister.freelancersKey < (freelancersIndex.length).sub(1)) {
            // Find the last Freelancer in the index of the registered Vaults.
            address lastFreelancer = freelancersIndex[(freelancersIndex.length).sub(1)];
            // Storage pointer to his registered Vault.
            KnownVault storage lastVault = KnownVaults[lastFreelancer];
            // Take the position of the Vault to unregister.
            lastVault.freelancersKey = vaultToUnregister.freelancersKey;
            // Move it in the index in place of the owner of the Vault to unregister.
            freelancersIndex[vaultToUnregister.freelancersKey] = lastFreelancer;
        }
        // Remove last element from index.
        freelancersIndex.length --;
        // Delete Vault entry in registry.
        delete vaultToUnregister;
    }

    /**
     * @dev Freelancer calls this method to create a new Vault contract.
     */
    function createVault (
        bytes32 _firstName,
        bytes32 _lastName,
        bytes16 _phone,
        bytes16 _other,
        bytes32 _email,
        bytes32 _jobTitle,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        bytes30 _additionalData,
        string _description
    )
        external
        returns (address)
    {

        // Sender must not have any Vault.
        require(
            KnownVaults[msg.sender] =! address(0),
            'You already have a Vault.'
        );
        // Sender must have access to his Vault in the Token.
        require(
            token.hasVaultAccess(msg.sender, msg.sender),
            'Sender has no access to Vault.'
        );

        // Create Vault contract.
        Vault newVault = new Vault(token);
        // TODO: decide autonomy of Vaults.

        // Register Vault.
        Vaults[msg.sender] = address(newVault);
        activeVaultsNumber = activeVaultsNumber.add(1);

        // Create Freelancer's Profile in his Vault.
        newVault.createProfile(
            _firstName,
            _lastName,
            _phone,
            _other,
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
     * @dev Set the Factory reader address.
     */
    function setFactoryReader(address _factoryReader) external onlyOwner {
        factoryReader = _factoryReader;
    }

    /**
     * Prevents accidental sending of ether to the factory.
     */
    function() public {
        revert();
    }
}
