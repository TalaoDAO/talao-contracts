pragma solidity ^0.4.24;

import './Talao.sol';
import './Freelancer.sol';

/**
 * @title Vault.
 * @dev A Talent's Vault.
 * @author SlowSense, Talao, Blockchain Partners.
 */
contract Vault is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Talao token contract.
    TalaoToken public myToken;

    // Freelancer contract.
    Freelancer public myFreelancer;

    // Documents counter.
    uint documentsCounter;
    // Used to parse all documents using index as relationship between this array and TalentsDocuments mapping.
    uint[] documentIndex;
    /**
     * @dev Document struct.
     * @dev published, encrypted, type_doc, type_version use slot 1.
     * @dev storage_type, misc, index use slot 2.
     * @dev title uses slot 3.
     * @dev storage_hash uses slot 4.
     */
    struct Document {
        // True if "published", false if "unpublished".
        bool published;

        // Encrypted.
        bool encrypted;

        // Type of document: 1 = work experience, ...
        uint8 type_doc;

        // Version of document type: 1 = "work experience version 1" document, if type_doc = 1
        uint8 type_version;

        // Storage type: 1 = IPFS, ...
        uint8 storage_type;

        // Basically we don't need that one now, we just add it to fill the slot 2. It might be usefull one day.
        uint8 misc;

        // Position in index.
        // Note: documentsCounter and documentIndex are still uint256 because it's cheaper outside of a struct.
        uint16 index;

        // Title.
        bytes32 title;

        // Storage hash.
        bytes32 storage_hash;
    }
    // Mapping: documentId => Document.
    mapping(uint => Document) public Documents;

    // Event: new document added.
    // Just because we need to get the document ID after the transaction, in the frontend.
    event NewDocument (
        uint id
    );

    /**
     * Constructor.
     */
    constructor(address _token, address _freelancer)
        public
    {
        myToken = TalaoToken(_token);
        myFreelancer = Freelancer(_freelancer);
    }

    /**
     * Modifier for functions to allow only active Freelancers.
     */
    modifier onlyActiveFreelancer () {
        // Accept only active Freelancers.
        require(myFreelancer.isActive(msg.sender), 'Sender is not active.');
        _;
    }

    /**
     * Modifier for functions to allow only users who have access to the Vault in the token + Partners.
     */
    modifier onlyVaultReaders() {
        // See if Vault price = 0 to allow anyone in that case.
        (uint accessPrice,,,) = myToken.data(owner);
        // Accept only users who have access to the Vault in the token + Partners.
        require(accessPrice == 0 || myFreelancer.isPartner(owner, msg.sender) || myToken.hasVaultAccess(msg.sender, owner), 'Sender has no Vault access.');
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
            uint8 type_doc,
            uint8 type_version,
            uint8 storage_type,
            uint8 misc,
            bytes32 title,
            bytes32 storage_hash,
            bool encrypted
        )
    {
        // Memory pointer.
        Document memory doc = Documents[_id];

        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
        require(doc.published, 'Document does not exist.');

        // Return data.
        type_doc = doc.type_doc;
        type_version = doc.type_version;
        storage_type = doc.storage_type;
        misc = doc.misc;
        title = doc.title;
        storage_hash = doc.storage_hash;
        encrypted = doc.encrypted;
    }

    /**
     * @dev Get all published documents.
     */
    function getDocuments()
        view
        public
        onlyVaultReaders
        returns (uint[])
    {
        return documentIndex;
    }

    /**
     * @dev Create a document.
     */
    function createDocument(
        uint8 _type_doc,
        uint8 _type_version,
        uint8 _storage_type,
        uint8 _misc,
        bytes32 _title,
        bytes32 _storage_hash,
        bool _encrypted
    )
        public
        onlyOwner
        onlyActiveFreelancer
        returns (uint)
    {
        // Validate parameters.
        require(_type_doc > 0, 'Type of document must be > 0.');
        require(_type_version > 0, 'Version of document type must be > 0.');
        require(
          _storage_hash == 0 || (_storage_hash > 0 && _storage_type > 0),
          'Storage type must be > 0.'
        );

        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);

        // Storage pointer.
        Document storage doc = Documents[documentsCounter];

        // Write data.
        doc.published = true;
        doc.encrypted = _encrypted;
        doc.type_doc = _type_doc;
        doc.type_version = _type_version;
        doc.storage_type = _storage_type;
        doc.misc = _misc;
        doc.index = uint16(documentIndex.push(documentsCounter).sub(1));
        doc.title = _title;
        doc.storage_hash = _storage_hash;

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
        uint8 _type_doc,
        uint8 _type_version,
        uint8 _storage_type,
        uint8 _misc,
        bytes32 _title,
        bytes32 _storage_hash,
        bool _encrypted
    )
        public
        onlyOwner
        onlyActiveFreelancer
    {
        // Storage pointer.
        Document storage doc = Documents[_id];

        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
        require(
          _storage_hash == 0 || (_storage_hash > 0 && _storage_type > 0),
          'Storage type must be > 0.'
        );
        require(doc.published, 'Document does not exist.');

        // Write data.
        doc.type_doc = _type_doc;
        doc.type_version = _type_version;
        doc.storage_type = _storage_type;
        doc.misc = _misc;
        doc.title = _title;
        doc.storage_hash = _storage_hash;
        doc.encrypted = _encrypted;
    }

    /**
     * @dev Remove a document.
     */
    function deleteDocument (uint _id)
        public
        onlyOwner
        onlyActiveFreelancer
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
        if (docToDelete.index < (documentIndex.length).sub(1)) {
          // Find the last document of the index.
          uint lastDocId = documentIndex[(documentIndex.length).sub(1)];
          Document storage lastDoc = Documents[lastDocId];
          // Move it in the index in place of the document to delete.
          documentIndex[docToDelete.index] = lastDocId;
          // Update this document that was moved from last position.
          lastDoc.index = docToDelete.index;
        }
        // Remove last element from index.
        documentIndex.length --;
        // Unpublish document.
        docToDelete.published = false;
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function ()
        public
    {
        revert();
    }
}
