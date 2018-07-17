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
        uint documentType,
        uint startDate,
        uint endDate,
        uint[] ratings,
        bytes32[] keywords
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
        bool agreement = false;
        agreement = myFreelancer.isPartner(owner, msg.sender);
        if(!agreement)
        {
            uint unused = 0;
            (agreement, unused) = myToken.accessAllowance(msg.sender,msg.sender);
            require(agreement == true);
        }
        _;
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function addDocument(
        bytes32 documentId, bytes32 title, string description, bytes32[] keywords, uint[] ratings, uint documentType, uint startDate, uint endDate
    )
        onlyOwner
        allowance
        public 
        returns (bool)
    {
        require(documentId != 0 && keywords.length != 0 && startDate != 0);
        require(keywords.length == ratings.length);
        require(!talentsDocuments[documentId].isAlive);
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
        
        emit VaultDocAdded(documentId,title,description,documentType,startDate,endDate,ratings,keywords);
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
        //if(talentsDocuments[documentId].description != 0) {
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
        returns (string desc, uint docType, uint startDate, uint endDate) 
    {
        require(dId != 0 && talentsDocuments[dId].isAlive == true);
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

    function getScoringByKeyword(bytes32 keyword)
        public
        allowance
        view
        returns(uint)
    {
        uint Score = 0;
        uint count = 0;
        for(uint i = 0; i < documentIndex.length; i++) {
            bytes32 index = documentIndex[i];
            for(uint j = 0; j < talentsDocuments[index].keywords.length; j++)
            {
                if(talentsDocuments[index].keywords[j] == keyword)
                {
                    //Only one keyword by experience
                    Score += talentsDocuments[index].ratings[j];
                    count++;
                    break;
                }
            }
        }
        return (Score * 20) / count;
    }

    function () 
        public 
    {
        revert();
    }
}