pragma solidity ^0.4.24;

/**
 * Uncomment to use the exact code of the Talao Token ICO on Mainnet.
 */
// import './ico/TalaoToken.sol';

/**
 * Comment to use the exact code of the Talao Token ICO on Mainnet.
 */
import './libraries/openzeppelin/SafeMath.sol';
import './inherited/openzeppelin/Ownable.sol';
import './token/TalaoToken.sol';

/**
 * @title Interface with a Marketplace.
 */
contract MarketplaceInterface {

  /**
   * @dev Submit this Vault to a Marketplace.
   */
  function submitVault() external;

  /**
   * @dev Remove this Vault from a Marketplace.
   */
  function removeVault() external;
}

/**
 * @title A Freelancer's Vault contract.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Vault is TalaoContract {

    // Enum for Marketplace status.
    enum KnownMarketplaceStatus = { Unknown, Validated, Pending }

    // Known Marketplace struct.
    struct KnownMarketplace {
        // Marketplace status.
        // takes same storage as an uint8 ? bytes31 left after this?
        KnownMarketplaceStatus status;

        // Key in pending Marketplaces index or validated Marketplaces index.
        // bytes27 left after this.
        uint32 indexKey;

        // TODO: bytes27 remain in the SSTORAGE n°1?
    }

    // Known Marketplaces.
    // TODO: public = OK?
    mapping (address => KnownMarketplace) public KnownMarketplaces;

    // Index of pending Marketplaces.
    address[] pendingMarketplaces;

    // Index of validated Marketplaces.
    address[] validatedMarketplaces;

    // Profile struct.
    struct Profile {
        // First name.
        // SSTORAGE 1 filled after this.
        bytes32 firstName;

        // Last name.
        // SSTORAGE 2 filled after this.
        bytes32 lastName;

        // Email.
        // SSTORAGE 3 filled after this.
        bytes32 email;

        // Job title.
        // SSTORAGE 4 filled after this.
        bytes32 jobTitle;

        // File hash of the profile picture.
        // SSTORAGE 5 filled after this.
        bytes32 pictureHash;

        // ID of the file engine used for the picture.
        // bytes30 left on SSTORAGE 6 after this.
        uint16 pictureEngine;

        // Mobile.
        // bytes4 left on SSTORAGE 6 after this.
        bytes16 mobile;

        // TODO: bytes4 left on SSTORAGE 6.

        // Description.
        string description;
    }

    // Profile.
    Profile profile;

    // Partners.
    mapping (address => bool) public Partners;

    // Document struct.
    struct Document {

        // File hash.
        // SSTORAGE 1 filled after this.
        bytes32 fileHash;

        // File engine.
        // 30 bytes remaining in SSTORAGE 2 after this.
        uint16 fileEngine;

        // Position in index.
        // 28 bytes remaining in SSTORAGE 2 after this.
        uint16 index;

        // Type of document: 1 = work experience, ...
        // 27 bytes remaining in SSTORAGE 2 after this.
        uint8 docType;

        // Version of document type: 1 = "work experience version 1" document, if type_doc = 1
        // 26 bytes remaining in SSTORAGE 2 after this.
        uint8 docTypeVersion;

        // True if "published", false if "unpublished".
        // 25 bytes remaining in SSTORAGE 2 after this.
        bool published;

        // Encrypted.
        // 24 bytes remaining in SSTORAGE 2 after this.
        bool encrypted;

        // To fill the 2nd SSTORAGE.
        bytes24 additionalData;
    }

    // Documents registry
    mapping(uint => Document) documentsRegistry;

    // Documents index.
    uint[] documentsIndex;

    // Event: new document added.
    // Frontend needs to get the document ID after the transaction.
    event NewDocument (
        uint id
    );

    /**
     * @dev Constructor.
     */
    constructor(address _talaoToken) {
        talaoToken = TalaoToken(_talaoToken);
    }

    /**
     * This modifier allows to use all read functions.
     */
    modifier onlyVaultReaders() {

        // Get Vault access price in the Talao token.
        (uint accessPrice,,,) = token.data(owner);

        // OR conditions to read all the Vault data:
        // 1) Sender is the owner or has paid Vault access price.
        // 2) Sender is a Partner and owner has Vault access in the Talao token.
        // 3) Vault is free and owner has Vault access in the Talao token.
        // 4) Sender is a validated Marketplace.
        require(
            (
                token.hasVaultAccess(owner, msg.sender) ||
                (
                    Partners[msg.sender] &&
                    token.hasVaultAccess(owner, owner)
                ) ||
                (
                    accessPrice == 0 &&
                    token.hasVaultAccess(owner, owner)
                ) ||
                KnownMarketplaces[msg.sender].status == KnownMarketplaceStatus.Validated
            ),
            'Vault access denied.'
        );
        _;
    }

    /**
     * @dev This modifier restricts all write functions to the owner,
     * @dev plus the owner must have an open Vault access in the Talao token.
     * @dev A Freelancer that has closed his Vault in the token,
     * @dev and received this deposit back, can not use write functions.
     * @dev Except functions inherited from Ownable.sol.
     */
    modifier onlyOwnerWithOpenVaultAccess() {

        require(isOwner(), 'Only owner is allowed.');
        require(
            token.hasVaultAccess(msg.sender, msg.sender),
            'Write is disabled if Vault access is closed in Talao token'
        )
        _;
    }

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDocument(uint _id)
        external
        view
        onlyVaultReaders
        returns (
            bytes32 fileHash,
            uint16 fileEngine,
            uint8 docType,
            uint8 docTypeVersion,
            bool encrypted,
            bytes24 additionalData
        )
    {
        // Memory pointer.
        Document memory doc = Documents[_id];

        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
        require(doc.published, 'Document does not exist.');

        // Return data.
        fileHash = doc.fileHash;
        fileEngine = doc.fileEngine;
        docType = doc.docType;
        docTypeVersion = doc.docTypeVersion;
        encrypted = doc.encrypted;
        additionalData = doc.additionalData;
    }

    /**
     * @dev Get all published documents.
     */
    function getDocuments() external view onlyVaultReaders returns (uint[]) {
        return documentsIndex;
    }

    /**
     * @dev Get profile.
     */
    function getProfile()
        external
        view
        returns (
        bytes16 firstName,
        bytes16 lastName,
        bytes16 phone,
        bytes16 email,
        bytes32 jobTitle,
        bytes32 pictureHash,
        uint16 pictureEngine,
        bytes30 additionalData,
        string description
    )
    {
        firstName = myProfile.firstName;
        lastName = myProfile.lastName;
        phone = myProfile.phone;
        email = myProfile.email;
        jobTitle = myProfile.jobTitle;
        pictureHash = myProfile.pictureHash;
        pictureEngine = myProfile.pictureEngine;
        additionalData = myProfile.additionalData;
        description = myProfile.description;
    }

    /**
     * @dev Create profile. Only used once by VaultFactory.
     */
    function createProfile(
        bytes32 _firstName,
        bytes32 _lastName,
        bytes16 _phone,
        bytes16 _email,
        bytes32 _jobTitle,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        bytes30 _additionalData,
        string _description
    )
        external
        onlyVaultFactory
    {
        myProfile.firstName = _firstName;
        myProfile.lastName = _lastName;
        myProfile.phone = _phone;
        myProfile.email = _email;
        myProfile.jobTitle = _jobTitle;
        myProfile.pictureHash = _pictureHash;
        myProfile.pictureEngine = _pictureEngine;
        myProfile.additionalData = _additionalData;
        myProfile.description = _description;
    }

    function editProfile(bytes _data) {

    }

    /**
     * @dev Edit profile.
     */
    function editProfile(
        string _patati,
        bytes16 _firstName,
        bytes16 _lastName,
        bytes16 _phone,
        bytes16 _email,
        bytes32 _jobTitle,
        bytes32 _pictureHash,
        uint16 _pictureEngine,
        bytes30 _additionalData,
        string _description,
    )
        external
        onlyOwner
        onlyActiveVault
    {
        myProfile.firstName = _firstName;
        myProfile.lastName = _lastName;
        myProfile.phone = _phone;
        myProfile.email = _email;
        myProfile.jobTitle = _jobTitle;
        myProfile.pictureHash = _pictureHash;
        myProfile.pictureEngine = _pictureEngine;
        myProfile.additionalData = _additionalData;
        myProfile.description = _description;
    }

    /**
     * @dev Freelancer can add or remove a Partner. Partner will have a free access to his Vault.
     */
    function setPartner(address _partner, bool _ispartner)
        external
        onlyOwner
        onlyActiveVault
    {
        Partners[_partner] = _ispartner;
    }

    /**
     * @dev Create a document.
     */
    function createDocument(
        bytes32 _fileHash,
        uint16 _fileEngine,
        uint8 _docType,
        uint8 _docTypeVersion,
        bool _encrypted,
        bytes24 _additionalData
    )
        external
        onlyOwner
        onlyActiveVault
        returns (uint)
    {
        // Validate parameters.
        require(_fileHash != '0x0', 'File hash must exist.');
        require(_fileEngine > 0, 'File engine must be > 0.');
        require(_docType > 0, 'Type of document must be > 0.');
        require(_docTypeVersion > 0, 'Version of document type must be > 0.');

        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);

        // Storage pointer.
        Document storage doc = Documents[documentsCounter];

        // Write data.
        doc.fileHash = _fileHash;
        doc.fileEngine = _fileEngine;
        doc.index = uint16(documentsIndex.push(documentsCounter).sub(1));
        doc.docType = _docType;
        doc.docTypeVersion = _docTypeVersion;
        doc.published = true;
        doc.encrypted = _encrypted;
        doc.additionalData = _additionalData;

        // Emit event.
        emit NewDocument(
            documentsCounter
        );

        return documentsCounter;
    }

    /**
     * @dev Update a document.
     */
    function updateDocument(
        uint _id,
        bytes32 _fileHash,
        uint16 _fileEngine,
        uint8 _docType,
        uint8 _docTypeVersion,
        bytes24 _additionalData
    )
        external
        onlyOwner
        onlyActiveVault
    {
        // Storage pointer.
        Document storage doc = Documents[_id];

        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
        require(_fileHash != '0x0', 'File hash must exist.');
        require(_fileEngine > 0, 'File engine must be > 0.');
        require(_docType > 0, 'Type of document must be > 0.');
        require(_docTypeVersion > 0, 'Version of document type must be > 0.');

        // Write data.
        doc.fileHash = _fileHash;
        doc.fileEngine = _fileEngine;
        doc.docType = _docType;
        doc.docTypeVersion = _docTypeVersion;
        doc.additionalData = _additionalData;
    }

    /**
     * @dev Remove a document.
     */
    function deleteDocument (uint _id) external onlyOwner onlyActiveVault {

        // Storage pointer.
        Document storage docToDelete = Documents[_id];

        // Validate parameters.
        require (_id > 0, 'Document ID must be > 0.');
        require(docToDelete.published, 'Document does not exist.');

        // If the removed document is not the last in the index,
        if (docToDelete.index < (documentsIndex.length).sub(1)) {
            // Find the last document of the index.
            uint lastDocId = documentsIndex[(documentsIndex.length).sub(1)];
            Document storage lastDoc = Documents[lastDocId];
            // Move it in the index in place of the document to delete.
            documentsIndex[docToDelete.index] = lastDocId;
            // Update this document that was moved from last position.
            lastDoc.index = docToDelete.index;
        }
        // Remove last element from index.
        documentsIndex.length --;
        // Unpublish document.
        docToDelete.published = false;
    }

    /**
     * @dev Submit the Vault to a Marketplace.
     */
    function submitVault() external onlyOwnerWithOpenVaultAccess {

        MarketplaceInterface marketplace;
        marketplace.submitVault();
    }

    /**
     * @dev Remove the Vault from Talao's Vault Registry.
     * @dev THERE IS NO WAY TO CANCEL THIS.
     * TODO: decide autonomy of Vaults.
     */
    function unregisterVault() external onlyOwner {

        // Validate.
        require(
            vaultFactoryInterface.hasActiveVault(msg.sender),
            'Vault must be active.'
        );

        // Remove Vault from Talao Vault Registry.
        vaultFactoryInterface.removeMyVault(msg.sender);
    }

    /**
     * @dev Delete the Vault.
     * @dev THERE IS NO WAY TO CANCEL THIS.
     */
    function deleteVault() external onlyOwner {

        // Validate.
        require(
            vaultFactoryInterface.hasActiveVault(msg.sender),
            'Vault must be active.'
        );

        // Remove Vault from Talao Vault Registry.
        vaultFactoryInterface.removeMyVault(msg.sender);

        // Delete data.
        for (uint i = 0; i < documentsIndex.length; i++) {
          delete Documents[i];
        }
        delete documentsIndex;
        delete documentsCounter;
        delete myProfile;

        // If by accident, the owner sent some Ether to this contract:
        selfdestruct(owner);
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function() public {
        revert();
    }
}
