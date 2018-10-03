// TODO: really allow Partner to add & remove documents ?

pragma solidity ^0.4.23;

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
    // Number of valid (= "published") documents in this Vault.
    uint public NbOfValidDocument;
    // Used to parse all documents using index as relationship between this array and TalentsDocuments mapping.
    uint[] documentIndex;
    // Document struct.
    struct certifiedDocument {
        // Title.
        bytes32 title;
        // Description.
        string description;
        // Timestamp of start.
        uint startDate;
        // Timestamp of end.
        uint endDate;
        // Duration in days.
        uint duration;
        // Array of keywords.
        bytes32[] keywords;
        // Array of ratings.
        uint[] ratings;
        // Type: ID = 0, DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4.
        uint documentType;
        // IPFS hash of the attached file, if any.
        bytes32 ipfs;
        // True if "published", false if "unpublished".
        bool isAlive;
        // Index used in relationship between tabindex and mapping unordered object. TODO: = ?
        uint index;
    }
    // Mapping: documentId => certifiedDocument.
    mapping(uint => certifiedDocument) public talentsDocuments;

    // Vault life enum.
    enum VaultLife { AccessDenied, DocumentAdded, DocumentRemoved, keywordAdded }

    // Event: important Vault events. TODO: what is usefull?
    event VaultLog (
        address indexed user,
        VaultLife happened,
        uint documentId
    );

    // Event: new document added.
    event VaultDocAdded (
        uint documentId,
        bytes32 title,
        string description,
        uint startDate,
        uint endDate,
        uint[] ratings,
        bytes32[] keywords,
        uint duration,
        uint docType,
        bytes32 ipfs
    );

    /**
     * Constructor.
     */
    constructor(address token, address freelancer)
        public
    {
        myToken = TalaoToken(token);
        myFreelancer = Freelancer(freelancer);
    }

    /**
     * Modifier for functions to allow only users who have access to the Vault in the token + Partners.
     */
    modifier allowVaultAccessAndPartners () {
        // Sender must be set.
        require (msg.sender != address(0), 'The Sender must be set.');
        // Is the Sender a partner?
        bool isPartner = myFreelancer.isPartner(owner, msg.sender);
        // Does the Sender have Vault access in the token?
        // Everyone if Vault price is 0.
        // Otherwise Talent + Clients who have bought Vault access.
        bool hasVaultAccess = myToken.hasVaultAccess (msg.sender, owner);
        // Accept only users who have access to the Vault in the token + Partners.
        require(isPartner || hasVaultAccess, 'Sender has no Vault access.');
        _;
    }

    /**
     * Modifier for functions to allow only Talent and his Partners.
     */
    modifier allowOwnerAndPartner () {
        // Sender must be set.
        require (msg.sender != address(0), 'The Sender must be set.');
        // Give access only to Talent and his Partners.
        require(owner == msg.sender || myFreelancer.isPartner(owner, msg.sender), 'Sender must be the Talent or one of his Partners.');
        _;
    }

    /**
     * @dev Add a document.
     */
    function addDocument(
        bytes32 title,
        string description,
        bytes32[] keywords,
        uint[] ratings,
        uint documentType,
        uint startDate,
        uint endDate,
        uint duration,
        bytes32 _ipfs
    )
        allowOwnerAndPartner
        public
        returns (uint)
    {
        // Validate parameters.
        require(title != 0, 'Title can not be empty.');
        require(bytes(description).length > 0, 'Description can not be empty.');
        require(keywords.length > 0, 'Keywords can not be empty.');
        require(ratings.length > 0, 'Ratings can not be empty.');
        require(startDate > 0, 'Start date must be > 0.');
        require(endDate > 0, 'End date must be > 0.');
        require(duration > 0, 'Duration must be > 0.');

        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);
        // Increment number of valid documents.
        NbOfValidDocument = NbOfValidDocument.add(1);

        // Write document data.
        certifiedDocument cd = talentsDocuments[documentsCounter];
        cd.title = title;
        cd.description = description;
        cd.startDate = startDate;
        cd.endDate = endDate;
        cd.duration = duration;
        cd.keywords = keywords;
        cd.ratings = ratings;
        cd.documentType = documentType;
        cd.ipfs = _ipfs;
        cd.isAlive = true;
        cd.index = documentIndex.push(documentsCounter).sub(1);

        // Emit event.
        emit VaultDocAdded(
            documentsCounter,
            title,
            description,
            startDate,
            endDate,
            ratings,
            keywords,
            duration,
            documentType,
            _ipfs
        );

        return documentsCounter;
    }

    /**
     * @dev Remove a document.
     */
    function removeDocument (uint documentId)
        allowOwnerAndPartner
        public
    {
        // Validate parameter.
        require (documentId > 0, 'documentId must be > 0.');
        // Only published documents can be removed.
        require (talentsDocuments[documentId].isAlive, 'Only published documents can be removed.');

        // Remove document data.
        delete talentsDocuments[documentId];
        // Check that among all document data, isAlive is now false (the default value).
        assert(!talentsDocuments[documentId].isAlive);
        // Remove document from index.
        delete documentIndex[documentId];
        // Document removal successfull, decrement number of published documents in Vault.
        NbOfValidDocument = NbOfValidDocument.sub(1);

        // Emit event. //TODO: usefull?
        emit VaultLog (msg.sender, VaultLife.DocumentRemoved, documentId);
    }

    /**
     * @dev Add an IPFS hash of an IPFS uploaded file, to attach it.
     * @param _id uint Document ID.
     * @param _ipfs bytes32 IPFS hash of the file.
     */
    function addIpfs(
        uint _id,
        bytes32 _ipfs
    )
        allowOwnerAndPartner
        public
    {
        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
         //TODO: better IPFS hash validation.
        require(_ipfs != 0, 'IPFS hash can not be empty.');
        // IPFS files can be attached only to published documents.
        require (talentsDocuments[_id].isAlive, 'IPFS files can be attached only to published documents.');

        // Write data.
        talentsDocuments[_id].ipfs = _ipfs;
    }

    /**
     * @dev See if document is published.
     * @param documentId uint Document ID.
     */
    function getDocumentIsAlive(uint documentId)
        allowVaultAccessAndPartners
        view
        public
        returns(bool)
    {
        require(documentId > 0, 'Document ID must be > 0');
        return (talentsDocuments[documentId].isAlive);
    }

    /**
     * @dev Document getter.
     * @param dId uint Document ID.
     */
    function getCertifiedDocumentById (uint dId)
        allowVaultAccessAndPartners
        view
        public
        returns (string desc, uint docType, uint startDate, uint endDate)
    {
        require(dId > 0, 'Document ID must be > 0.');
        require(talentsDocuments[dId].isAlive, 'Document does not exist.');

        return (
            talentsDocuments[dId].description,
            talentsDocuments[dId].documentType,
            talentsDocuments[dId].startDate,
            talentsDocuments[dId].endDate
        );
    }

    /**
     * @dev Get full document.
     * @param id uint Document ID.
     */
    function getFullDocument(uint id)
        allowVaultAccessAndPartners
        view
        public
        returns (
            bytes32 title,
            string description,
            bytes32[] keywords,
            uint[] ratings,
            bool isAlive,
            uint index,
            uint documentType,
            uint startDate,
            uint endDate,
            bytes32 ipfs
        )
    {
        certifiedDocument cd = talentsDocuments[id];
        return (
            cd.title,
            cd.description,
            cd.keywords,
            cd.ratings,
            cd.isAlive,
            cd.index,
            cd.documentType,
            cd.startDate,
            cd.endDate,
            cd.ipfs
        );
    }

    /**
     * @dev Get hash of IPFS attached file, if any.
     * @param _id uint Document ID.
     */
    function getIpfs(uint _id)
        allowVaultAccessAndPartners
        view
        public
        returns(bytes32 ipfs)
    {
        require(_id > 0, 'Document ID must be > 0');
        require(talentsDocuments[_id].isAlive, 'Document does not exist.');
        return (talentsDocuments[_id].ipfs);
    }

    /**
     * @dev Get all documents in index.
     * @param index uint Document ID.
     */
    function getCertifiedDocumentsByIndex (uint index)
        allowVaultAccessAndPartners
        view
        public
        returns (uint docId, string desc, uint docType, uint startDate, uint endDate, bytes32 ifpsHash)
    {
        uint dId = documentIndex[index];
        return (
          dId,
          talentsDocuments[dId].description,
          talentsDocuments[dId].documentType,
          talentsDocuments[dId].startDate,
          talentsDocuments[dId].endDate,
          talentsDocuments[dId].ipfs
        );
    }

    /**
     * @dev Get documents index.
     */
    function getDocumentIndexes()
        view
        public
        returns (uint[])
    {
        return documentIndex;
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
