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
        // Sender must be set.
        require (msg.sender != address(0), 'Sender must be set.');
        // See if Vault price = 0 to allow anyone in that case.
        (uint accessPrice, address appointedAgent, uint sharingPlan, uint userDeposit) = myToken.data(owner);
        // Accept only users who have access to the Vault in the token + Partners.
        require(accessPrice == 0 || myFreelancer.isPartner(owner, msg.sender) || myToken.hasVaultAccess(msg.sender, owner), 'Sender has no Vault access.');
        _;
    }

    /**
     * @dev See if document is published.
     * @param _id uint Document ID.
     */
    function isDocPublished(uint _id)
        view
        public
        onlyVaultReaders
        returns(bool isPublished)
    {
        require(_id > 0, 'Document ID must be > 0');

        isPublished = Documents[_id].published;
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
            uint doctype,
            bytes32 ipfs
        )
    {
        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');

        // Validate doc state.
        Document memory doc = Documents[_id];
        require(doc.published, 'Document does not exist.');

        // Return data.
        title = doc.title;
        description = doc.description;
        start = doc.start;
        end = doc.end;
        duration = doc.duration;
        keywords = doc.keywords;
        doctype = doc.doctype;
        ipfs = doc.ipfs;
    }

    /**
     * @dev Get all published documents.
     */
    function getDocs()
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
    function createDoc(
        bytes32 _title,
        string _description,
        uint _start,
        uint _end,
        uint _duration,
        bytes32[] _keywords,
        uint _doctype,
        bytes32 _ipfs
    )
        public
        onlyOwner
        onlyActiveFreelancer
        returns (uint)
    {
        // Validate parameters.
        require(_title != 0, 'Title can not be empty.');
        require(_doctype > 0, 'Type must be > 0.');

        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);

        // Write document data.
        Document storage doc = Documents[documentsCounter];
        doc.title = _title;
        doc.description = _description;
        doc.start = _start;
        doc.end = _end;
        doc.duration = _duration;
        doc.keywords = _keywords;
        doc.doctype = _doctype;
        doc.ipfs = _ipfs;
        doc.published = true;
        doc.index = documentIndex.push(documentsCounter).sub(1);

        // Emit event.
        emit NewDocument(
            documentsCounter
        );

        return documentsCounter;
    }

    /**
     * @dev Set an IPFS hash of an IPFS uploaded file, to attach it.
     * @param _id uint Document ID.
     * @param _ipfs bytes32 IPFS hash of the file.
     */
    function setDocIpfs(
        uint _id,
        bytes32 _ipfs
    )
        public
        onlyOwner
        onlyActiveFreelancer
    {
        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
        require(_ipfs != 0, 'IPFS hash can not be empty.');

        // Validate doc state.
        Document storage doc = Documents[_id];
        require (doc.published, 'IPFS files can be attached only to published documents.');

        // Write data.
        doc.ipfs = _ipfs;
    }

    /**
     * @dev Remove a document.
     */
    function deleteDoc (uint _id)
        public
        onlyOwner
        onlyActiveFreelancer
    {
        // Validate parameter.
        require (_id > 0, 'Document ID must be > 0.');

        // Validate state.
        Document storage docToDelete = Documents[_id];
        require (docToDelete.published, 'Only published documents can be removed.');

        /**
         * Remove document from index.
         */

        // If the removed document is not the last in the index,
        if (docToDelete.index < (documentIndex.length - 1)) {
          // Find the last document of the index.
          uint lastDocId = documentIndex[(documentIndex.length - 1)];
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
