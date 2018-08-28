pragma solidity ^0.4.23;

import "./Talao.sol";
import "./Freelancer.sol";

contract Vault is Ownable {

    using SafeMath for uint;

    // TODO Get data ?
    uint NbOfValidDocument;
    TalaoToken myToken;
    Freelancer myFreelancer;

    //Used to parse all documents using index as relationship between this array and TalentsDocuments mapping
    bytes32[] documentIndex;

    struct certifiedDocument {
        bytes32 title;
        string description; //description of document
        bytes32[] keywords; //list of keywords associated to the current certified document
        uint[] ratings;
        bool isAlive; //true if this stuct is set, fasle else
        uint index; //index used in relationship between tabindex and mapping unordered object
        uint documentType; //ID = 0, DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4
        uint startDate;
        uint endDate;
        uint duration;
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
        uint duration
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
        bool isPartner = myFreelancer.isPartner(owner, msg.sender);
        bool isVaultAccess = myToken.hasVaultAccess(owner,msg.sender);
        require(isPartner || isVaultAccess,"user has no vault access");
        _;
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function addDocument(
        bytes32 documentId, bytes32 title, string description, bytes32[] keywords, uint[] ratings, uint documentType, uint startDate, uint endDate, uint duration
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
        talentsDocuments[documentId].duration = duration;
        
        emit VaultDocAdded(documentId,title,description,startDate,endDate,ratings,keywords,duration);
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

        NbOfValidDocument--;
        delete talentsDocuments[documentId]; //set isValid to false
        assert(talentsDocuments[documentId].isAlive==false);
        emit VaultLog(msg.sender, VaultLife.DocumentRemoved, documentId);
        //}
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
        returns (bytes32 docId, string desc, uint docType, uint startDate, uint endDate)
    {
        bytes32 dId = documentIndex[index];
        return (dId, talentsDocuments[dId].description, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate);
    }

    function () 
        public 
    {
        revert();
    }
}