pragma solidity ^0.4.24;

import "./ClaimHolder.sol";
import "../Foundation.sol";
import "../token/TalaoToken.sol";

/**
 * @title Identity = ERC 725/735 + fondation + token + creator + category + encryption keys
 * @author Talao, Polynomial.
 */
contract Identity is ClaimHolder {

    // Foundation contract.
    Foundation foundation;

    // Talao token contract.
    TalaoToken public token;

    // Identity information struct.
    struct IdentityInformation {
        // Address of this contract creator (factory).
        // bytes16 left on SSTORAGE 1 after this.
        address creator;

        // Identity category.
        // 1001 => 1999: Freelancer.
        // 2001 => 2999: Freelancer team.
        // 3001 => 3999: Corporate marketplace.
        // 4001 => 4999: Public marketplace.
        // 5001 => 5999: Service provider.
        // ..
        // 64001 => 64999: ?
        // bytes14 left after this on SSTORAGE 1.
        uint16 category;

        // Asymetric encryption key algorithm.
        // We use an integer to store algo with offchain references.
        // 1 => RSA
        // bytes12 left after this on SSTORAGE 1.
        uint16 asymetricEncryptionAlgorithm;

        // Symetric encryption key algorithm.
        // We use an integer to store algo with offchain references.
        // 1 => AES 256
        // bytes10 left after this on SSTORAGE 1.
        uint16 symetricEncryptionAlgorithm;

        // Asymetric encryption public key.
        // This one can be used to encrypt content especially for this
        // contract owner, which is the only one to have the private key,
        // offchain of course.
        bytes asymetricEncryptionPublickey;

        // Encrypted symetric encryption passphrase.
        // When decrypted, this passphrase can regenerate
        // the symetric encryption key.
        // This key encrypts and decrypts data to be shared with many people.
        // Uses 1 full SSTORAGE for AES 256.
        bytes symetricEncryptionEncryptedPassphrase;
    }
    // This contract Identity information.
    IdentityInformation public identityInformation;

    // Blacklisted addresses.
    mapping(address => bool) public fileboxBlacklist;

    // Event emitted when someone left us an decentralized encrypted file.
    event FileboxReceived (
        address indexed sender,
        bytes32 fileHash,
        uint16 fileEngine
    );

    /**
     * @dev Constructor.
     */
    constructor(
        address _foundation,
        address _token,
        uint16 _category,
        uint16 _asymetricEncryptionAlgorithm,
        uint16 _symetricEncryptionAlgorithm,
        bytes _asymetricEncryptionPublickey,
        bytes symetricEncryptionEncryptedpassphrase
    )
        public
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        identityInformation.creator = msg.sender;
        identityInformation.category = _category;
        identityInformation.asymetricEncryptionAlgorithm = _asymetricEncryptionAlgorithm;
        identityInformation.symetricEncryptionAlgorithm = _symetricEncryptionAlgorithm;
        identityInformation.asymetricEncryptionPublickey = _asymetricEncryptionPublickey;
        identityInformation.symetricEncryptionEncryptedPassphrase = symetricEncryptionEncryptedpassphrase;
    }

    /**
     * @dev Owner of this contract, in the Foundation sense.
     * @dev We do not allow this to be used externally,
     * @dev since a contract could fake ownership.
     * @dev In other contracts, you have to call the Foundation to
     * @dev know the real owner of this contract.
     */
    function identityOwner() internal view returns (address) {
        return foundation.contractsToOwners(address(this));
    }

    /**
     * @dev Check in Foundation if msg.sender is the owner of this contract.
     * @dev Same remark.
     */
    function isIdentityOwner() internal view returns (bool) {
        return msg.sender == identityOwner();
    }

    /**
     * @dev Modifier version of isIdentityOwner.
     */
    modifier onlyIdentityOwner() {
        require(isIdentityOwner(), 'Access denied');
        _;
    }

    /**
     * @dev Owner functions require open Vault in token.
     */
    function isActiveIdentityOwner() public view returns (bool) {
        return isIdentityOwner() && token.hasVaultAccess(msg.sender, msg.sender);
    }

    /**
     * @dev Modifier version of isActiveOwner.
     */
    modifier onlyActiveIdentityOwner() {
        require(isActiveIdentityOwner(), 'Access denied');
        _;
    }

    /**
     * @dev Does this contract owner have an open Vault in the token?
     */
    function isActiveIdentity() public view returns (bool) {
        return token.hasVaultAccess(identityOwner(), identityOwner());
    }

    /**
     * @dev Does msg.sender have an ERC 725 key with certain purpose,
     * and does the contract owner have an open Vault in the token?
     */
    function hasIdentityPurpose(uint256 _purpose) public view returns (bool) {
        return (
            (
                keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), 1) ||
                keyHasPurpose(keccak256(abi.encodePacked(msg.sender)), _purpose)
            ) &&
            isActiveIdentity()
        );
    }

    /**
     * @dev Modifier version of hasKeyForPurpose
     */
    modifier onlyIdentityPurpose(uint256 _purpose) {
        require(hasIdentityPurpose(_purpose), 'Access denied');
        _;
    }

    /**
     * @dev "Send" a "file" to the owner.
     */
    function sendFilebox(bytes32 _fileHash, uint16 _fileEngine) external {
        require(!fileboxBlacklist[msg.sender], 'You are blacklisted');
        emit FileboxReceived(msg.sender, _fileHash, _fileEngine);
    }

    /**
     * @dev Blacklist.
     */
    function blacklistAddressInFilebox(address _address)
        external
        onlyIdentityPurpose(20004)
    {
        fileboxBlacklist[_address] = true;
    }

    /**
     * @dev Unblacklist.
     */
    function unblacklistAddressInFilebox(address _address)
        external
        onlyIdentityPurpose(20004)
    {
        fileboxBlacklist[_address] = false;
    }
}

/**
 * @title Interface with clones or inherited contracts.
 */
interface IdentityInterface {
    function identityInformation()
        external
        view
        returns (address, uint16, uint16, uint16, uint16, uint16, bytes, bytes);
}
