// TODO: business logic should not depend as much on Events.
// TODO: methods using allowance modifier allow for instance to add documents to a Vault you have access to.
// TODO: problem of struct limitation: to add ipfsHash, we dumped duration. Otherwise, getting a Stack too deep issue.

pragma solidity ^0.4.23;

import "./Talao.sol";
import "./Freelancer.sol";

contract Vault is Ownable {

    using SafeMath for uint;

    uint public NbOfValidDocument;
    TalaoToken public myToken;
    Freelancer public myFreelancer;

    //Used to parse all documents using index as relationship between this array and TalentsDocuments mapping
    bytes32[] documentIndex;

    struct certifiedDocument {
        bytes32 title; // TODO: string instead, to allow longer titles?
        string description; //description of document
        bytes32[] keywords; //list of keywords associated to the current certified document
        uint[] ratings;
        bool isAlive; //true if this stuct is set, fasle else
        uint index; //index used in relationship between tabindex and mapping unordered object
        uint documentType; //ID = 0, DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4
        uint startDate;
        uint endDate;
        bytes32 ipfsHash; // IPFS hash of the IPFS uploaded attached file, if any (applies to Blockcerts certificates at least).
    }

    // TODO Infura gateway blockchain

    //address is owner of certified document
    mapping(bytes32 => certifiedDocument) public talentsDocuments;

    enum VaultLife { AccessDenied, DocumentAdded, DocumentRemoved, keywordAdded }

    event VaultLog (
        address indexed user,
        VaultLife happened,
        bytes32 documentId
    );

    event VaultDocAdded (
        bytes32 documentId,
        bytes32 title,
        string description,
        uint startDate,
        uint endDate,
        uint[] ratings,
        bytes32[] keywords,
        bytes32 ipfsHash
    );

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    constructor(address token, address freelancer)
        public
    {
        myToken = TalaoToken(token);
        myFreelancer = Freelancer(freelancer);
    }

    modifier allowance () { //require sur l'aggreement
        require(msg.sender!=address(0),"The sender must be initialized");

        bool isPartner = myFreelancer.isPartner(owner, msg.sender);
        bool isVaultAccess = myToken.hasVaultAccess(msg.sender,owner);
        require(isPartner || isVaultAccess,"user has no vault access");
        _;
    }

    modifier allowOwnerAndPartner () {
        require(msg.sender != address(0), 'Sender can not be empty.');
        bool isOwner;
        if (owner == msg.sender) {
          isOwner = true;
        }
        bool isPartner = myFreelancer.isPartner(owner, msg.sender);
        require(isOwner || isPartner, 'Sender must be the freelance or one of his partners.');
        _;
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function addDocument(
        bytes32 documentId, bytes32 title, string description, bytes32[] keywords, uint[] ratings, uint documentType, uint startDate, uint endDate, bytes32 _ipfsHash
    )
        onlyOwner
        allowance
        public
        returns (bool)
    {
        require(documentId != 0 && keywords.length != 0 && startDate != 0, "document ID is not correct");
        require(keywords.length == ratings.length, "Error on keywords and ratings tab");
        require(!talentsDocuments[documentId].isAlive, "document already exists");

        SafeMath.add(NbOfValidDocument,1);

        talentsDocuments[documentId].keywords = keywords;
        talentsDocuments[documentId].ratings = ratings;
        talentsDocuments[documentId].title = title;
        talentsDocuments[documentId].description = description;
        talentsDocuments[documentId].isAlive = true;
        talentsDocuments[documentId].index = documentIndex.push(documentId)-1;
        talentsDocuments[documentId].documentType = documentType;
        talentsDocuments[documentId].startDate = startDate;
        talentsDocuments[documentId].endDate = endDate;
        talentsDocuments[documentId].ipfsHash = _ipfsHash;

        emit VaultDocAdded(documentId,title,description,startDate,endDate,ratings,keywords, _ipfsHash);
        return true;
    }

    /*
    Remove existing document using document id
    accessibility : only for authorized user and owner of this contract
    */
    function removeDocument (bytes32 documentId)
        onlyOwner
        allowance
        public
    {
        require(documentId != 0, "document ID is not correct");

        SafeMath.sub(NbOfValidDocument, 1);
        delete talentsDocuments[documentId]; // Set isValid to false.
        assert(talentsDocuments[documentId].isAlive == false);
        emit VaultLog(msg.sender, VaultLife.DocumentRemoved, documentId);
    }

    /**
     * @dev Edit a Vault document.
     * @param _id The document ID to edit.
     */
    function editDocument(
        bytes32 _id,
        uint _type,
        bytes32 _ipfsHash,
        bytes32 _title,
        string _description,
        bytes32[] _keywords,
        uint[] _ratings,
        uint _startDate,
        uint _endDate
    )
        allowOwnerAndPartner
        public
    {
        require(_id != 0, 'Id can not be empty');
        require(talentsDocuments[_id].isAlive, 'This document never existed or was deleted. It can not be edited.');
        require(_title != 0, 'Title can not be empty.');
        require(bytes(_description).length > 0, 'Description can not be empty.');
        require(_keywords.length > 0, 'Keywords can not be empty.');
        require(_ratings.length > 0, 'Ratings can not be empty.');
        require(_startDate > 0, 'Start date can not be empty.');
        require(_endDate > 0, 'End date can not be empty.');
        require(_keywords.length == _ratings.length, 'Keywords and ratings must be in same quantity.');

        talentsDocuments[_id].documentType = _type;
        talentsDocuments[_id].ipfsHash = _ipfsHash;
        talentsDocuments[_id].title = _title;
        talentsDocuments[_id].description = _description;
        talentsDocuments[_id].keywords = _keywords;
        talentsDocuments[_id].ratings = _ratings;
        talentsDocuments[_id].startDate = _startDate;
        talentsDocuments[_id].endDate = _endDate;
    }

    /*
    get indication to know quickly if document removed or not
    accessibility : only for authorized user
    */
    function getDocumentIsAlive(bytes32 documentId)
        onlyOwner
        allowance
        view
        public
        returns(bool)
    {
        require(documentId != 0, "document ID is not correct");
        return(talentsDocuments[documentId].isAlive);
    }

    /*
    this method allows the client to retrieve a specific certified document data
    using document Id provided by ethereum when a document is uploaded
    accessibility : only for authorized user
    */
    function getCertifiedDocumentById (bytes32 dId)
        allowance
        view
        public
        returns (string desc, uint docType, uint startDate, uint endDate)
    {
        require(dId != 0 && talentsDocuments[dId].isAlive == true, "document ID is not correct");
        return (talentsDocuments[dId].description, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate);
    }

    /*
    This method allows the client to retrieve the list of documents (documents by documents) by browsing it with his index
    accessibility : only for authorized user
    */
    function getCertifiedDocumentsByIndex (uint index)
        allowance
        view
        public
        returns (bytes32 docId, string desc, uint docType, uint startDate, uint endDate, bytes32 ifpsHash)
    {
        bytes32 dId = documentIndex[index];
        return (dId, talentsDocuments[dId].description, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate, talentsDocuments[dId].ipfsHash);
    }

    function getFullDocument(bytes32 id)
        allowance
        view
        public
        returns (bytes32 title, string description, bytes32[] keywords,
          uint[] ratings, bool isAlive, uint index, uint documentType, uint startDate,
          uint endDate, bytes32 ipfsHash)
    {
        certifiedDocument cd = talentsDocuments[id];
        return (cd.title, cd.description, cd.keywords, cd.ratings, cd.isAlive, cd.index,
                cd.documentType, cd.startDate, cd.endDate, cd.ipfsHash);
    }

    function getDocumentIndexes()
        view
        public
        returns (bytes32[])
    {
        return documentIndex;
    }

    function ()
        public
    {
        revert();
    }
}
