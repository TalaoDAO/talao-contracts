pragma solidity ^0.4.23;

contract MiniVault{

    address owner;

    modifier onlyOwner()
    {
        require(owner == msg.sender);
        _;
    }

    struct Information {
        // public freelancer data
        bytes32 firstName;
        bytes32 lastName;
        bytes32 mobilePhone;
        bytes32 email;
        bytes32 title;
        string description; 
        bool isMobilephone;
        bool isEmail;
    }

    // mapping between Vault Ethereum address and Confidence Index
    mapping(address => Information) public FreelancerInformation;

    uint NbOfValidDocument;

    //Used to parse all documents using index as relationship between this array and TalentsDocuments mapping
    bytes32[] documentIndex;

    struct certifiedDocument {
        bytes32 title;
        bytes32 description; //description of document
        bytes32[] keywords; //list of keywords associated to the current certified document
        uint[] ratings;
        bool isAlive; //true if this stuct is set, fasle else
        uint index; //index used in relationship between tabindex and mapping unordered object
        uint documentType; //ID = 0, DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4
        uint startDate;
        uint endDate;
        uint duration;
    }
    
    //address is owner of certified document
    mapping(bytes32 => certifiedDocument) public talentsDocuments;

    enum VaultLife { AccessDenied, DocumentAdded, DocumentRemoved, keywordAdded }

    event VaultLog (
        address indexed user, 
        VaultLife happened,
        bytes32 documentId
    );

    event VaultDocAdded (
        address indexed user,
        bytes32 documentId,
        bytes32 title,
        bytes32 description,
        uint documentType,
        uint startDate,
        uint endDate,
        uint[] ratings,
        bytes32[] keywords
    );

    event FreelancerUpdateData (
        address indexed freelancer,
        bytes32 firstname,
        bytes32 lastname,
        bytes32 phone,
        bytes32 email,
        bytes32 title,
        string description
    );

    constructor()
        public
    {
        owner = msg.sender;
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function addDocument(
        bytes32 documentId, bytes32 title, bytes32 description, bytes32[] keywords, uint[] ratings, uint documentType, uint startDate, uint endDate, uint duration
    )
        public
        returns (bool)
    {
        require(documentId != 0 && keywords.length != 0 && startDate != 0);
        require(keywords.length == ratings.length);
        require(!talentsDocuments[documentId].isAlive);
        NbOfValidDocument++;

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
        
        emit VaultDocAdded(msg.sender,documentId,title,description,documentType,startDate,endDate,ratings,keywords);
        return true;
    }

    /*
    Remove existing document using document id
    accessibility : only for authorized user and owner of this contract
    */
    function removeDocument (bytes32 documentId)
        onlyOwner
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

    function InitFreelanceData(bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _title, string _description)
        onlyOwner
        public
    {
        FreelancerInformation[msg.sender].firstName = _firstname;
        FreelancerInformation[msg.sender].lastName = _lastname;
        FreelancerInformation[msg.sender].mobilePhone = _phone;
        FreelancerInformation[msg.sender].email = _email;
        FreelancerInformation[msg.sender].title = _title;
        FreelancerInformation[msg.sender].description = _description;

        emit FreelancerUpdateData(msg.sender, _firstname, _lastname, _phone, _email, _title, _description);
    }

    function () 
        public 
    {
        revert();
    }
}