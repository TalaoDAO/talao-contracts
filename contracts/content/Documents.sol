pragma solidity ^0.4.24;

import "../math/SafeMath.sol";
import "../access/Permissions.sol";

/**
 * @title A Documents contract allows to manage documents and share them.
 * @notice Also contracts that have an ERC 725 Claim key (3)
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

        // Position in index.
        // 28 bytes remaining in SSTORAGE 1 after this.
        uint16 index;

        // Type of document:
        // ...
        // 50000 => 59999: experiences
        // 60000 => max: certificates
        // 26 bytes remaining in SSTORAGE 1 after this.
        uint16 docType;

        // Version of document type: 1 = "work experience version 1" document, if type_doc = 1
        // 24 bytes remaining in SSTORAGE 1 after this.
        uint16 docTypeVersion;

        // ID of related experience, for certificates.
        // 22 bytes remaining in SSTORAGE 1 after this.
        uint16 related;

        // ID of the file location engine.
        // 1 = IPFS, 2 = Swarm, 3 = Filecoin, ...
        // 20 bytes remaining in SSTORAGE 1 after this.
        uint16 fileLocationEngine;

        // Issuer of the document.
        // SSTORAGE 1 full after this.
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

    // Event: certificate issued.
    event CertificateIssued (bytes32 indexed checksum, address indexed issuer, uint id);

    // Event: certificate accepted.
    event CertificateAccepted (bytes32 indexed checksum, address indexed issuer, uint id);

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDocument(uint _id)
        external
        view
        onlyReader
        returns (
            uint16,
            uint16,
            address,
            bytes32,
            uint16,
            bytes,
            bool,
            uint16
        )
    {
        Document memory doc = documents[_id];
        require(doc.published);
        return(
            doc.docType,
            doc.docTypeVersion,
            doc.issuer,
            doc.fileChecksum,
            doc.fileLocationEngine,
            doc.fileLocationHash,
            doc.encrypted,
            doc.related
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
        uint16 _docType,
        uint16 _docTypeVersion,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted
    )
        external
        onlyIdentityPurpose(20002)
        returns(uint)
    {
        require(_docType < 60000);
        _createDocument(
            _docType,
            _docTypeVersion,
            msg.sender,
            _fileChecksum,
            _fileLocationEngine,
            _fileLocationHash,
            _encrypted,
            0
        );
        return documentsCounter;
    }

    /**
     * @dev Issue a certificate.
     */
    function issueCertificate(
        uint16 _docType,
        uint16 _docTypeVersion,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted,
        uint16 _related
    )
        external
        returns(uint)
    {
        require(
          keyHasPurpose(keccak256(abi.encodePacked(foundation.membersToContracts(msg.sender))), 3) &&
          isActiveIdentity() &&
          _docType >= 60000
        );
        uint id = _createDocument(
            _docType,
            _docTypeVersion,
            foundation.membersToContracts(msg.sender),
            _fileChecksum,
            _fileLocationEngine,
            _fileLocationHash,
            _encrypted,
            _related
        );
        emit CertificateIssued(_fileChecksum, foundation.membersToContracts(msg.sender), id);
        return id;
    }

    /**
     * @dev Accept a certificate.
     */
    function acceptCertificate(uint _id) external onlyIdentityPurpose(20002) {
        Document storage doc = documents[_id];
        require(!doc.published && doc.docType >= 60000);
        // Add to index.
        doc.index = uint16(documentsIndex.push(_id).sub(1));
        // Publish.
        doc.published = true;
        // Unpublish related experience, if published.
        if (documents[doc.related].published) {
            _deleteDocument(doc.related);
        }
        // Emit event.
        emit CertificateAccepted(doc.fileChecksum, doc.issuer, _id);
    }

    /**
     * @dev Create a document.
     */
    function _createDocument(
        uint16 _docType,
        uint16 _docTypeVersion,
        address _issuer,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted,
        uint16 _related
    )
        internal
        returns(uint)
    {
        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);
        // Storage pointer.
        Document storage doc = documents[documentsCounter];
        // For certificates:
        // - add the related experience
        // - do not add to index
        // - do not publish.
        if (_docType >= 60000) {
            doc.related = _related;
        } else {
            // Add to index.
            doc.index = uint16(documentsIndex.push(documentsCounter).sub(1));
            // Publish.
            doc.published = true;
        }
        // Common data.
        doc.encrypted = _encrypted;
        doc.docType = _docType;
        doc.docTypeVersion = _docTypeVersion;
        doc.fileLocationEngine = _fileLocationEngine;
        doc.issuer = _issuer;
        doc.fileChecksum = _fileChecksum;
        doc.fileLocationHash = _fileLocationHash;
        // Emit event.
        emit DocumentAdded(documentsCounter);
        // Return document ID.
        return documentsCounter;
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
        require (_id > 0);
        require(docToDelete.published);
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
     * Updating a document makes no sense technically.
     * Here we provide a function that deletes a doc & create a new one.
     * But for UX it's very important to have this in 1 transaction.
     */
    function updateDocument(
        uint _id,
        uint16 _docType,
        uint16 _docTypeVersion,
        bytes32 _fileChecksum,
        uint16 _fileLocationEngine,
        bytes _fileLocationHash,
        bool _encrypted
    )
        external
        onlyIdentityPurpose(20002)
        returns (uint)
    {
        require(_docType < 60000);
        _deleteDocument(_id);
        _createDocument(
            _docType,
            _docTypeVersion,
            msg.sender,
            _fileChecksum,
            _fileLocationEngine,
            _fileLocationHash,
            _encrypted,
            0
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
            uint16,
            uint16,
            address,
            bytes32,
            uint16,
            bytes,
            bool,
            uint16
        );
}
