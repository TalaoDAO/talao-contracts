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
    uint public publishedDocumentsNb;
    // Used to parse all documents using index as relationship between this array and TalentsDocuments mapping.
    uint[] documentIndex;
    // Document struct.
    struct Document {
        // Title.
        bytes32 title;
        // Description.
        string description;
        // Timestamp of start.
        uint start;
        // Timestamp of end.
        uint end;
        // Duration in days.
        uint duration;
        // Array of keywords.
        bytes32[] keywords;
        // Array of ratings.
        uint[] ratings;
        // Type: DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4, 5 = ID
        uint doctype;
        // IPFS hash of the attached file, if any.
        bytes32 ipfs;
        // True if "published", false if "unpublished".
        bool published;
        // Position in index.
        uint index;
    }
    // Mapping: documentId => Document.
    mapping(uint => Document) public Documents;

    // Event: new document added.
    event NewDocument (
        uint id,
        bytes32 title,
        string description,
        uint start,
        uint end,
        uint duration,
        bytes32[] keywords,
        uint[] ratings,
        uint doctype,
        bytes32 ipfs
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
     * Modifier for functions to allow only users who have access to the Vault in the token + Partners.
     */
    modifier onlyVaultReaders () {
        // Sender must be set.
        require (msg.sender != address(0), 'Sender must be set.');
        // Accept only users who have access to the Vault in the token + Partners.
        require(myFreelancer.isPartner(owner, msg.sender) || myToken.hasVaultAccess (msg.sender, owner), 'Sender has no Vault access.');
        _;
    }

    /**
     * @dev Create a document.
     */
    function createDoc(
        bytes32 _title,
        string _description,
        uint _start,
        uint _end,
        uint _duration,
        bytes32[] _keywords,
        uint[] _ratings,
        uint _doctype,
        bytes32 _ipfs
    )
        public
        onlyOwner
        returns (uint)
    {
        // Validate parameters.
        require(_title != 0, 'Title can not be empty.');
        require(_doctype > 0, 'Type must be > 0.');

        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);
        // Increment number of valid documents.
        publishedDocumentsNb = publishedDocumentsNb.add(1);

        // Write document data.
        Document storage doc = Documents[documentsCounter];
        doc.title = _title;
        doc.description = _description;
        doc.start = _start;
        doc.end = _end;
        doc.duration = _duration;
        doc.keywords = _keywords;
        doc.ratings = _ratings;
        doc.doctype = _doctype;
        doc.ipfs = _ipfs;
        doc.published = true;
        doc.index = documentIndex.push(documentsCounter).sub(1);

        // Emit event.
        emit NewDocument(
            documentsCounter,
            _title,
            _description,
            _start,
            _end,
            _duration,
            _keywords,
            _ratings,
            _doctype,
            _ipfs
        );

        return documentsCounter;
    }

    /**
     * @dev Remove a document.
     */
    function deleteDoc (uint _id)
        public
        onlyOwner
    {
        // Validate parameter.
        require (_id > 0, 'Document ID must be > 0.');
        // Only published documents can be removed.
        require (Documents[_id].published, 'Only published documents can be removed.');

        // Remove document data.
        delete Documents[_id];
        // Check that among all document data, published is now false (the default value).
        assert(!Documents[_id].published);
        // Remove document from index.
        delete documentIndex[_id];
        // Document removal successfull, decrement number of published documents in Vault.
        publishedDocumentsNb = publishedDocumentsNb.sub(1);
    }

    /**
     * @dev Set an IPFS hash of an IPFS uploaded file, to attach it.
     * @param _id uint Document ID.
     * @param _ipfs bytes32 IPFS hash of the file.
     */
    function addDocIpfs(
        uint _id,
        bytes32 _ipfs
    )
        public
        onlyOwner
    {
        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
         //TODO: better IPFS hash validation.
        require(_ipfs != 0, 'IPFS hash can not be empty.');
        // IPFS files can be attached only to published documents.
        require (Documents[_id].published, 'IPFS files can be attached only to published documents.');

        // Write data.
        Documents[_id].ipfs = _ipfs;
    }

    /**
     * @dev See if document is published.
     * @param _id uint Document ID.
     */
    function isDocPublished(uint _id)
        view
        public
        onlyVaultReaders
        returns(bool)
    {
        require(_id > 0, 'Document ID must be > 0');
        return (Documents[_id].published);
    }

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDoc(uint _id)
        view
        public
        onlyVaultReaders
        returns (
            bytes32 title,
            string description,
            uint start,
            uint end,
            uint duration,
            bytes32[] keywords,
            uint[] ratings,
            uint doctype,
            bytes32 ipfs
        )
    {
        require(_id > 0, 'Document ID must be > 0.');
        require(Documents[_id].published, 'Document does not exist.');

        Document storage doc = Documents[_id];
        return (
            doc.title,
            doc.description,
            doc.start,
            doc.end,
            doc.duration,
            doc.keywords,
            doc.ratings,
            doc.doctype,
            doc.ipfs
        );
    }

    /**
     * @dev Get hash of IPFS attached file, if any.
     * @param _id uint Document ID.
     */
    function getDocIpfs(uint _id)
        view
        public
        onlyVaultReaders
        returns(bytes32 ipfs)
    {
        require(_id > 0, 'Document ID must be > 0');
        require(Documents[_id].published, 'Document does not exist.');
        return (Documents[_id].ipfs);
    }

    /**
     * @dev Get document by index.
     * @param _index uint Document index.
     */
    function getDocByIndex (uint _index)
        view
        public
        onlyVaultReaders
        returns (
            bytes32 title,
            string description,
            uint start,
            uint end,
            uint duration,
            bytes32[] keywords,
            uint[] ratings,
            uint doctype,
            bytes32 ipfs
        )
    {
        uint id = documentIndex[_index];
        Document storage doc = Documents[id];
        return (
            doc.title,
            doc.description,
            doc.start,
            doc.end,
            doc.duration,
            doc.keywords,
            doc.ratings,
            doc.doctype,
            doc.ipfs
        );
    }

    /**
     * @dev Get documents index.
     */
    function getDocumentsIndex()
        view
        public
        onlyVaultReaders
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
