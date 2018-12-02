pragma solidity ^0.4.24;

import './Talao.sol';

/**
 * @title Interface for Vault Factory, which created this contract.
 * TODO: decide autonomy of Vaults.
 */
contract VaultFactoryInterface {

  /**
   * @notice Checks that the Freelancer has an active Vault.
   */
  function hasActiveVault(address _freelancerAddress) public view returns (bool);

  /**
   * @notice Remove this Vault from Talao's Vault Factory.
   */
  function removeMyVault(address _freelancerAddress) public;
}

/**
 * @title Vault.
 * @dev A Freelancer's Vault.
 * @author Talao, SlowSense, Blockchain Partners.
 */
contract Vault is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Talao token.
    TalaoToken token;

    // Interface with Vault Factory contract.
    VaultFactoryInterface vaultFactoryInterface;
    // TODO: decide autonomy of Vaults.

    // Profile struct.
    struct Profile {
      bytes16 firstName;
      bytes16 lastName;
      // So far we have used 1 SSTORAGE.
      bytes16 phone;
      bytes16 email;
      // So far we have used 2 SSTORAGEs.
      bytes32 jobTitle;
      // So far we have used 3 SSTORAGEs.
      bytes32 pictureHash;
      // So far we have used 4 SSTORAGEs.
      uint16 pictureEngine;
      // We have 30 bytes left, let's fill them into 1 property for the future.
      bytes30 additionalData;
      // So far we have used 5 SSTORAGEs.
      string description;
      // Storage cost depends on the string.
    }

    // Profile.
    Profile myProfile;

    // Partners.
    mapping (address => bool) public Partners;

    // Documents counter.
    uint documentsCounter;

    // Documents index.
    uint[] documentsIndex;

    // Document struct.
    struct Document {

        // File hash.
        bytes32 fileHash;
        // So far we have used 1 SSTORAGE.

        // File engine.
        uint16 fileEngine;
        // 30 bytes remaining in SSTORAGE 2.

        // Position in index.
        // Note: documentsCounter and documentsIndex are still uint256 because it's cheaper outside of a struct.
        uint16 index;
        // 28 bytes remaining in SSTORAGE 2.

        // Type of document: 1 = work experience, ...
        uint8 docType;
        // 27 bytes remaining in SSTORAGE 2.

        // Version of document type: 1 = "work experience version 1" document, if type_doc = 1
        uint8 docTypeVersion;
        // 26 bytes remaining in SSTORAGE 2.

        // True if "published", false if "unpublished".
        bool published;
        // 25 bytes remaining in SSTORAGE 2.

        // Encrypted.
        bool encrypted;
        // 24 bytes remaining in SSTORAGE 2.

        // To fill the 2nd SSTORAGE, let's add this, it might proove usefull.
        bytes24 additionalData;
    }

    // Documents.
    mapping(uint => Document) Documents;

    // Event: new document added.
    // Because frontend needs to get the document ID after the transaction.
    event NewDocument (
        uint id
    );

    /**
     * Constructor.
     */
    constructor(address _tokenAddress, address _vaultFactoryAddress) public {
        token = TalaoToken(_tokenAddress);
        vaultFactoryInterface = VaultFactoryInterface(_vaultFactoryAddress);
        // TODO: decide autonomy of Vaults.
    }

    /**
     * @notice Allow only VaultFactory.
     * @dev Only used at Vault creation.
     * TODO: decide autonomy of Vaults.
     */
    modifier onlyVaultFactory() {
        require(
          msg.sender == address(vaultFactoryInterface),
          'Only VaultFactory is authorized.'
        );
        _;
    }

    /**
     * Allow only active Vaults.
     * TODO: decide autonomy of Vaults.
     */
    modifier onlyActiveVault() {
        require(
            vaultFactoryInterface.hasActiveVault(msg.sender),
            'Vault is not active.'
        );
        _;
    }

    /**
     * Allow only users who have access to the Vault in the token + Partners.
     */
    modifier onlyVaultReaders() {

        // Get Vault price in the token.
        (uint accessPrice,,,) = token.data(owner);

        // Vault must be free, or the user must have paid or be a Partner.
        require(
            (
                accessPrice == 0 ||
                token.hasVaultAccess(msg.sender, owner) ||
                Partners[msg.sender]
            ),
            'You have no Vault access.'
        );
        _;
    }

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDocument(uint _id)
        view
        public
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
    function getDocuments() view public onlyVaultReaders returns (uint[]) {
        return documentsIndex;
    }

    /**
     * @dev Get profile.
     */
    function getProfile()
        public
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

    /**
     * @dev Edit profile.
     */
    function editProfile(
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
        public
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
        public
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
        public
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
    function deleteDocument (uint _id)
        public
        onlyOwner
        onlyActiveVault
    {
        // Storage pointer.
        Document storage docToDelete = Documents[_id];

        // Validate parameters.
        require (_id > 0, 'Document ID must be > 0.');
        require(docToDelete.published, 'Document does not exist.');

        /**
         * Remove document from index.
         */

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
