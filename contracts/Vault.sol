pragma solidity ^0.4.23;

import "./Talao.sol";

contract Vault is Ownable {
    using SafeMath for uint;

    uint NbOfValidDocument;
    TalaoToken myToken;
    
    struct certifiedDocument {
        bytes32 description; //description of document
        bytes32[] keywords; //list of keywords associated to the current certified document
        bool isAlive; //true if this stuct is set, fasle else
        uint index; //index used in relationship between tabindex and mapping unordered object
        uint documentType; //ID = 0, DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4
        uint startDate;
        uint endDate;
        bool isBlockCert;
    }

    //Used to parse all documents using index as relationship between this array and TalentsDocuments mapping
    bytes32[] documentIndex;

    //address is owner of document
    //Certified
    mapping(bytes32 => certifiedDocument) public talentsDocuments;

    //whitelisted address of partners to get a free access to vault
    mapping(address=>mapping(address=>bool)) public ListedPartner;

    enum VaultLife { AccessDenied, DocumentAdded, DocumentRemoved, keywordAdded }

    event VaultLog (
        address indexed user, 
        VaultLife happened,
        bytes32 documentId
    );

    event VaultDocAdded (
        address indexed user,
        bytes32 documentId,
        bytes32 description,
        uint documentType,
        uint startDate,
        uint endDate,
        bool isBlockCert
    );

    modifier allowance () { //require sur l'aggreement
        bool agreement = false;
        uint unused = 0;
        (agreement, unused) = myToken.accessAllowance(msg.sender,msg.sender);
        require(agreement == true);
        _;
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    constructor(address token) 
        public 
    {
        myToken = TalaoToken(token);
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function addDocument(
        bytes32 documentId, bytes32 description, bytes32[] keywords, uint documentType, uint startDate, uint endDate, bool isBlockCert
    ) 
        onlyOwner 
        allowance 
        public 
        returns (bool)
    {
        require(documentId != 0 && keywords.length != 0 && startDate != 0);
        require(!talentsDocuments[documentId].isAlive);
        SafeMath.add(NbOfValidDocument,1);

        talentsDocuments[documentId].description = description;
        talentsDocuments[documentId].isAlive = true;
        talentsDocuments[documentId].index = documentIndex.push(documentId)-1;
        talentsDocuments[documentId].keywords = keywords;
        talentsDocuments[documentId].documentType = documentType;
        talentsDocuments[documentId].startDate = startDate;
        talentsDocuments[documentId].endDate = endDate;
        talentsDocuments[documentId].isBlockCert = isBlockCert;
        
        emit VaultDocAdded(msg.sender,documentId,description,documentType,startDate,endDate,isBlockCert);
        return true;
    }

    /*
    Add keyword to a specified document using document Id
    accessibility : only for authorized user and owner of this contract
    */
    function addKeyword(bytes32 documentId,bytes32 keyword)
        onlyOwner
        allowance
        public
        returns (bool)
    {
        require(documentId != 0 && keyword.length != 0);
        require(talentsDocuments[documentId].isAlive);

        talentsDocuments[documentId].keywords.push(keyword);
        emit VaultLog(msg.sender, VaultLife.keywordAdded, documentId);
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
        require(documentId != 0);
        if(talentsDocuments[documentId].description.length != 0) {
            NbOfValidDocument--;
            delete talentsDocuments[documentId]; //set isValid to false
            assert(talentsDocuments[documentId].isAlive==false);
            emit VaultLog(msg.sender, VaultLife.DocumentRemoved, documentId);
        }
    }

    /*
    get indication to know quickly if document removed or not
    accessibility : only for authorized user
    */
    function getDocumentIsAlive(bytes32 documentId) 
        allowance
        view
        public
        returns(bool) 
    {
        require(documentId != 0);
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
        returns (bytes32 desc, bytes32[] keywords, uint docType, uint startDate, uint endDate, bool isBlockCert) 
    {
        require(dId != 0 && talentsDocuments[dId].isAlive == true);
        return (talentsDocuments[dId].description, talentsDocuments[dId].keywords, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate, talentsDocuments[dId].isBlockCert);
    }

    /*
    This method allows the client to retrieve the list of documents (documents by documents) by browsing it with his index
    accessibility : only for authorized user
    */
    function getCertifiedDocumentsByIndex (uint index)
        allowance
        view
        public
        returns (bytes32 docId, bytes32 desc, bytes32[] keywords, uint docType, uint startDate, uint endDate, bool isBlockCert)
    {
        bytes32 dId = documentIndex[index];
        return (dId, talentsDocuments[dId].description, talentsDocuments[dId].keywords, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate, talentsDocuments[dId].isBlockCert);
    }

    /*
    get list of interestng document based on search keyword
    accessibility : only for authorized user
    */
    function getMatchCertifiedDocument (uint index, bytes32 keyword)
        allowance
        view
        public
        returns(bytes32 docId, bytes32 desc)
    {
        bytes32 dId = documentIndex[index];
        bytes32 valueFounded;
        for (uint i = 0; i < talentsDocuments[dId].keywords.length; i++) {
            valueFounded = talentsDocuments[dId].keywords[i];
            if(keccak256(valueFounded) == keccak256(keyword)){
                return (dId, talentsDocuments[dId].description);  
            }
        }
    }

    /*
    Get FCR of the owner of the VaultDocAdded
    */
    function getScoring() 
        public
        allowance
        view
        returns(uint)
    {
        uint scoreEducation = 0;
        uint scoreWork = 0;
        uint scoreSkills = 0;
        for(uint i = 0; i < documentIndex.length; i++) {
            bytes32 index = documentIndex[i];
            scoreSkills += talentsDocuments[index].keywords.length;
            if(talentsDocuments[index].documentType == 2 && scoreEducation < 10) {
                scoreEducation += 2;
            }
            else if(talentsDocuments[index].documentType == 4 && scoreWork < 20) {
                scoreWork += 2;
            }
        }
        if(scoreSkills > 40) scoreSkills = 40;
        return scoreEducation + scoreWork + scoreSkills;
    }

    /**
     * Freelance can whitelist a partner. Partner will have a free access to his Vault
    */ 
    function listPartner(address _partner, bool IsListed)
        onlyOwner
        public
    {
        ListedPartner[msg.sender][_partner] = IsListed;
    }
    
    function () 
        public 
    {
        revert();
    }
}