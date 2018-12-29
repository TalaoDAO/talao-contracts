pragma solidity ^0.4.24;

import "./ClaimHolder.sol";
import "../Foundation.sol";
import "../token/TalaoToken.sol";

/**
 * @title The Identity is where ERC 725/735 and our custom code meet.
 * @author Talao, Polynomial.
 * @notice Mixes ERC 725/735, foundation, token,
 * constructor values that never change (creator, category, encryption keys)
 * and provides a box to receive decentralized files and texts.
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
        // 1 => AES 128
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
        // Uses 0.5 SSTORAGE for AES 128.
        bytes symetricEncryptionEncryptedPassphrase;
    }
    // This contract Identity information.
    IdentityInformation public identityInformation;

    // Identity box: blacklisted addresses.
    mapping(address => bool) public identityboxBlacklisted;

    // Identity box: event when someone sent us a text.
    event TextReceived (
        address indexed sender,
        uint indexed category,
        bytes text
    );

    // Identity box: event when someone sent us an decentralized file.
    event FileReceived (
        address indexed sender,
        uint indexed fileType,
        uint fileEngine,
        bytes fileHash
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
     * @dev "Send" a text to this contract.
     * Text should be encrypted on this contract asymetricEncryptionPublickey,
     * before submitting a TX here.
     */
    function identityboxSendtext(uint _category, bytes _text) external {
        require(!identityboxBlacklisted[msg.sender], 'You are blacklisted');
        emit TextReceived(msg.sender, _category, _text);
    }

    /**
     * @dev "Send" a "file" to this contract.
     * File should be encrypted on this contract asymetricEncryptionPublickey,
     * before upload on decentralized file storage,
     * before submitting a TX here.
     */
    function identityboxSendfile(
        uint _fileType, uint _fileEngine, bytes _fileHash
    )
        external
    {
        require(!identityboxBlacklisted[msg.sender], 'You are blacklisted');
        emit FileReceived(msg.sender, _fileType, _fileEngine, _fileHash);
    }

    /**
     * @dev Blacklist an address in this Identity box.
     */
    function identityboxBlacklist(address _address)
        external
        onlyIdentityPurpose(20004)
    {
        identityboxBlacklisted[_address] = true;
    }

    /**
     * @dev Unblacklist.
     */
    function identityboxUnblacklist(address _address)
        external
        onlyIdentityPurpose(20004)
    {
        identityboxBlacklisted[_address] = false;
    }
}

/**
 * @title Interface with clones or inherited contracts.
 */
interface IdentityInterface {
    function identityInformation()
        external
        view
        returns (address, uint16, uint16, uint16, bytes, bytes);
}
