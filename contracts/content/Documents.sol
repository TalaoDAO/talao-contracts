pragma solidity ^0.4.24;

import "../math/SafeMath.sol";
import "../access/Permissions.sol";

/**
 * @title A Documents contract allows to manage documents and share them.
 * @notice Also contracts that have an ERC 725 Certificate key ()
 * can add certified documents.
 * @author Talao, Polynomial, SlowSense, Blockchain Partners.
 */
contract Documents is Permissions {

    using SafeMath for uint;

    // Document struct.
    struct Document {

        // True if "published", false if "unpublished".
        // 31 bytes remaining in SSTORAGE 1 after this.
        bool published;

        // True if doc is encrypted.
        // 30 bytes remaining in SSTORAGE 1 after this.
        bool encrypted;

        // Type of document:
        // 1 = issued experience (restricted)
        // etc.
        // 29 bytes remaining in SSTORAGE 1 after this.
        uint8 docType;

        // Version of document type: 1 = "work experience version 1" document, if type_doc = 1
        // 28 bytes remaining in SSTORAGE 1 after this.
        uint8 docTypeVersion;

        // Position in index.
        // 26 bytes remaining in SSTORAGE 1 after this.
        uint16 index;

        // ID of the file location engine.
        // 1 = IPFS, 2 = Swarm, 3 = Filecoin, ...
        // 24 bytes remaining in SSTORAGE 1 after this.
        uint16 fileLocationEngine;

        // Issuer of the document.
        // 4 bytes remaining in SSTORAGE 1 after this.
        address issuer;

        // Checksum of the file (SHA-256 offchain).
        // SSTORAGE 2 filled after this.
        bytes32 fileChecksum;

        // Hash of the file location in a decentralized engine.
        // Example: IPFS hash, Swarm hash, Filecoin hash...
        // Uses 1 SSTORAGE for IPFS.
        bytes fileLocationHash;
    }

    // Documents registry.
    mapping(uint => Document) internal documents;

    // Documents index.
    uint[] internal documentsIndex;

    // Documents counter.
    uint internal documentsCounter;

    // Event: new document added.
    event DocumentAdded (uint id);

    // Event: document removed.
    event DocumentRemoved (uint id);

    // Event: document issued.
    event DocumentIssued (bytes32 indexed checksum, address indexed issuer);

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDocument(uint _id)
        external
        view
        onlyReader
        returns (
            uint8,
            uint8,
            address,
            bytes32,
            uint16,
            bytes,
            bool
        )
    {
        Document memory doc = documents[_id];
        require(_id > 0, 'Document ID must be > 0');
        require(doc.published, 'Document does not exist');
        return(
            doc.docType,
            doc.docTypeVersion,
            doc.issuer,
            doc.fileChecksum,
            doc.fileLocationEngine,
            doc.fileLocationHash,
            doc.encrypted
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
        uint8 _docType,
        uint8 _docTypeVersion,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted
    )
        external
        onlyIdentityPurpose(20002)
        returns (uint)
    {
        require(_docType != 1, 'Type 1 is restricted to issueDocument()');
        _createDocument(
            _docType,
            _docTypeVersion,
            msg.sender,
            _fileChecksum,
            _fileLocationEngine,
            _fileLocationHash,
            _encrypted
        );
        return documentsCounter;
    }

    /**
     * @dev Issue a document.
     */
    function issueDocument(
        uint8 _docTypeVersion,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted
    )
        external
        returns (uint)
    {
        require(
            (
                keyHasPurpose(keccak256(abi.encodePacked(foundation.membersToContracts(msg.sender))), 3) &&
                isActiveIdentity()
            ),
            'Access denied'
        );
        _createDocument(
            1,
            _docTypeVersion,
            foundation.membersToContracts(msg.sender),
            _fileChecksum,
            _fileLocationEngine,
            _fileLocationHash,
            _encrypted
        );
        emit DocumentIssued(_fileChecksum, foundation.membersToContracts(msg.sender));
        return documentsCounter;
    }

    /**
     * @dev Create a document.
     */
    function _createDocument(
        uint8 _docType,
        uint8 _docTypeVersion,
        address _issuer,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted
    )
        internal
    {
        require(_docType > 0, 'Type of document must be > 0');
        require(_docTypeVersion > 0, 'Version of document type must be > 0');
        require(_fileChecksum[0] != 0, 'File checksum must exist');
        require(_fileLocationEngine > 0, 'File engine must be > 0');
        require(_fileLocationHash[0] != 0, 'File hash must exist');
        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);
        // Storage pointer.
        Document storage doc = documents[documentsCounter];
        // Write data.
        doc.published = true;
        doc.encrypted = _encrypted;
        doc.docType = _docType;
        doc.docTypeVersion = _docTypeVersion;
        doc.index = uint16(documentsIndex.push(documentsCounter).sub(1));
        doc.fileLocationEngine = _fileLocationEngine;
        doc.issuer = _issuer;
        doc.fileChecksum = _fileChecksum;
        doc.fileLocationHash = _fileLocationHash;
        // Emit event.
        emit DocumentAdded(documentsCounter);
    }

    /**
     * @dev Remove a document.
     */
    function deleteDocument (uint _id) external onlyIdentityPurpose(20002) {
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
        // Emit event.
        emit DocumentRemoved(_id);
    }

    /**
     * @dev "Update" a document.
     * @dev Updating a document makes no sense technically.
     * @dev Here we provide a function that deletes a doc & create a new one.
     * @dev But for UX it's very important to have this in 1 transaction.
     */
    function updateDocument(
        uint _id,
        uint8 _docType,
        uint8 _docTypeVersion,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted
    )
        external
        onlyIdentityPurpose(20002)
        returns (uint)
    {
        require(_docType != 1, 'Type 1 is restricted to issueDocument()');
        _deleteDocument(_id);
        _createDocument(
            _docType,
            _docTypeVersion,
            msg.sender,
            _fileChecksum,
            _fileLocationEngine,
            _fileLocationHash,
            _encrypted
        );
        return documentsCounter;
    }
}


/**
 * @title Interface with clones, inherited contracts or services.
 */
interface DocumentsInterface {
    function getDocuments() external returns(uint[]);
    function getDocument(uint)
        external
        returns (
            uint8,
            uint8,
            address,
            bytes32,
            uint16,
            bytes,
            bool
        );
}
