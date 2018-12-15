pragma solidity ^0.4.24;

import '../math/SafeMath.sol';
import '../access/Tokenized.sol';

/**
 * @title A Documents contract allows to manage documents and share them.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Documents is Tokenized {

    using SafeMath for uint;

    // Document struct.
    struct Document {

        // File hash.
        // SSTORAGE 1 filled after this.
        bytes32 fileHash;

        // File engine.
        // 30 bytes remaining in SSTORAGE 2 after this.
        uint16 fileEngine;

        // Encryption algorithm.
        // 28 bytes remaining in SSTORAGE 2 after this.
        uint16 encryptionAlgorithm;

        // Position in index.
        // 26 bytes remaining in SSTORAGE 2 after this.
        uint16 index;

        // Type of document: 1 = work experience, ...
        // 25 bytes remaining in SSTORAGE 2 after this.
        uint8 docType;

        // Version of document type: 1 = "work experience version 1" document, if type_doc = 1
        // 24 bytes remaining in SSTORAGE 2 after this.
        uint8 docTypeVersion;

        // True if "published", false if "unpublished".
        // 23 bytes remaining in SSTORAGE 2 after this.
        bool published;

        // To fill the 2nd SSTORAGE.
        bytes24 additionalData;
    }

    // Documents registry.
    mapping(uint => Document) internal documents;

    // Documents index.
    uint[] internal documentsIndex;

    // Documents counter.
    uint internal documentsCounter;

    // Event: new document added.
    // Frontend needs to get the document ID after the transaction.
    event DocumentAdded (
        uint id
    );

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDocument(uint _id)
        external
        view
        onlyReader
        returns (
            bytes32,
            uint16,
            uint16,
            uint8,
            uint8,
            bytes24
        )
    {
        Document memory doc = documents[_id];
        require(_id > 0, 'Document ID must be > 0');
        require(doc.published, 'Document does not exist');
        return(
            doc.fileHash,
            doc.fileEngine,
            doc.encryptionAlgorithm,
            doc.docType,
            doc.docTypeVersion,
            doc.additionalData
        );
    }

    /**
     * @dev Get all published documents.
     */
    function getDocuments() external view onlyReader returns (uint[]) {
        return documentsIndex;
    }

    /**
     * @dev Create a document.
     */
    function createDocument(
        bytes32 _fileHash,
        uint16 _fileEngine,
        uint16 _encryptionAlgorithm,
        uint8 _docType,
        uint8 _docTypeVersion,
        bytes24 _additionalData
    )
        external
        onlyOwnerInFoundation
        returns (uint)
    {
        _createDocument(
            _fileHash,
            _fileEngine,
            _encryptionAlgorithm,
            _docType,
            _docTypeVersion,
            _additionalData
        );
        return documentsCounter;
    }

    /**
     * @dev Create a document.
     */
    function _createDocument(
        bytes32 _fileHash,
        uint16 _fileEngine,
        uint16 _encryptionAlgorithm,
        uint8 _docType,
        uint8 _docTypeVersion,
        bytes24 _additionalData
    )
        internal
    {
        require(_fileHash[0] != 0, 'File hash must exist');
        require(_fileEngine > 0, 'File engine must be > 0');
        require(_docType > 0, 'Type of document must be > 0');
        require(_docTypeVersion > 0, 'Version of document type must be > 0');
        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);
        // Storage pointer.
        Document storage doc = documents[documentsCounter];
        // Write data.
        doc.fileHash = _fileHash;
        doc.fileEngine = _fileEngine;
        doc.encryptionAlgorithm = _encryptionAlgorithm;
        doc.index = uint16(documentsIndex.push(documentsCounter).sub(1));
        doc.docType = _docType;
        doc.docTypeVersion = _docTypeVersion;
        doc.published = true;
        doc.additionalData = _additionalData;
        // Emit event.
        emit DocumentAdded(
            documentsCounter
        );
    }

    /**
     * @dev Remove a document.
     */
    function deleteDocument (uint _id) external onlyOwnerInFoundation {
        _deleteDocument(_id);
    }

    /**
     * @dev Remove a document.
     */
    function _deleteDocument (uint _id) internal {
        Document storage docToDelete = documents[_id];
        require (_id > 0, 'Document ID must be > 0');
        require(docToDelete.published, 'Document does not exist');
        // If the removed document is not the last in the index,
        if (docToDelete.index < (documentsIndex.length).sub(1)) {
            // Find the last document of the index.
            uint lastDocId = documentsIndex[(documentsIndex.length).sub(1)];
            Document storage lastDoc = documents[lastDocId];
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
     * @dev "Update" a document.
     * @dev Updating a document makes no sense technically.
     * @dev Here we provide a function that deletes a doc & create a new one.
     * @dev But for UX it's very important to have this in 1 transaction.
     */
    function updateDocument(
        uint _id,
        bytes32 _fileHash,
        uint16 _fileEngine,
        uint16 _encryptionAlgorithm,
        uint8 _docType,
        uint8 _docTypeVersion,
        bytes24 _additionalData
    )
        external
        onlyOwnerInFoundation
        returns (uint)
    {
        _deleteDocument(_id);
        _createDocument(
            _fileHash,
            _fileEngine,
            _encryptionAlgorithm,
            _docType,
            _docTypeVersion,
            _additionalData
        );
        return documentsCounter;
    }
}
