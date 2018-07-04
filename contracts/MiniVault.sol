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
        bytes32 description; 
        bool isMobilephone;
        bool isEmail;


        FreelancerState state;
        bool isUserKYC;
        // this is the origin of the freelance for future use
        uint8 referral;
        uint256 subscriptionDate;
        //used to penalize (bad behavior, wrong info) or reward (fidelity, good activity) a user
        uint256 karma;
    }

    // mapping between Vault Ethereum address and Confidence Index
    mapping(address => Information) public FreelancerInformation;

    //whitelisted address of partners to get a free access to vault
    mapping(address => mapping(address=>bool)) public ListedPartner;

    enum FreelancerState { Inactive, Active, Suspended }
    // TODO Get data ?

    uint NbOfValidDocument;

    //Used to parse all documents using index as relationship between this array and TalentsDocuments mapping
    bytes32[] documentIndex;

    struct certifiedDocument {
        bytes32 description; //description of document
        competency[] competencies; //list of keywords associated to the current certified document
        bool isAlive; //true if this stuct is set, fasle else
        uint index; //index used in relationship between tabindex and mapping unordered object
        uint documentType; //ID = 0, DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4
        uint startDate;
        uint endDate;
        uint duration;
        bool isBlockCert;
    }

    struct competency {
        bytes32 name;
        uint rating;
    }

    // TODO struct avec mots clés

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
        address indexed user,
        bytes32 documentId,
        bytes32 description,
        uint documentType,
        uint startDate,
        uint endDate,
        uint duration,
        bool isBlockCert
    );

    event FreelancerUpdateData (
        address indexed freelancer,
        bytes32 firstname,
        bytes32 lastname,
        bytes32 phone,
        bytes32 email,
        bytes32 description
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
        bytes32 documentId, bytes32 description, bytes32[] keywords, uint[] ratings, uint documentType, uint startDate, uint endDate, uint duration, bool isBlockCert
    )
        public
        returns (bool)
    {
        require(documentId != 0 && keywords.length != 0 && startDate != 0);
        require(keywords.length == ratings.length);
        require(!talentsDocuments[documentId].isAlive);
        NbOfValidDocument++;

        for(uint i = 0; i < keywords.length; i++)
        {
            require(ratings[i] >= 0 && ratings[i] <= 5);
            talentsDocuments[documentId].competencies.push(competency(keywords[i], ratings[i]));
        }

        talentsDocuments[documentId].description = description;
        talentsDocuments[documentId].isAlive = true;
        talentsDocuments[documentId].index = documentIndex.push(documentId)-1;
        talentsDocuments[documentId].documentType = documentType;
        talentsDocuments[documentId].startDate = startDate;
        talentsDocuments[documentId].endDate = endDate;
        talentsDocuments[documentId].duration = duration;
        talentsDocuments[documentId].isBlockCert = isBlockCert;
        
        emit VaultDocAdded(msg.sender,documentId,description,documentType,startDate,endDate,duration,isBlockCert);
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

    /*
    this method allows the client to retrieve a specific certified document data
    using document Id provided by ethereum when a document is uploaded
    accessibility : only for authorized user
    */
    function getCertifiedDocumentById (bytes32 dId)
        onlyOwner
        view
        public
        returns (bytes32 desc, uint docType, uint startDate, uint endDate, bool isBlockCert) 
    {
        require(dId != 0 && talentsDocuments[dId].isAlive == true);
        return (talentsDocuments[dId].description, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate, talentsDocuments[dId].isBlockCert);
    }

    /*
    This method allows the client to retrieve the list of documents (documents by documents) by browsing it with his index
    accessibility : only for authorized user
    */
    function getCertifiedDocumentsByIndex (uint index)
        onlyOwner
        view
        public
        returns (bytes32 docId, bytes32 desc, uint docType, uint startDate, uint endDate, bool isBlockCert)
    {
        bytes32 dId = documentIndex[index];
        return (dId, talentsDocuments[dId].description, talentsDocuments[dId].documentType,
        talentsDocuments[dId].startDate, talentsDocuments[dId].endDate, talentsDocuments[dId].isBlockCert);
    }

    function InitFreelanceData(bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _description)
        onlyOwner
        public
    {
        require(FreelancerInformation[msg.sender].state != FreelancerState.Suspended);
        if (FreelancerInformation[msg.sender].state == FreelancerState.Inactive)
        {
            FreelancerInformation[msg.sender].subscriptionDate = now;
        }
        FreelancerInformation[msg.sender].state == FreelancerState.Active;
        FreelancerInformation[msg.sender].firstName = _firstname;
        FreelancerInformation[msg.sender].lastName = _lastname;
        FreelancerInformation[msg.sender].mobilePhone = _phone;
        FreelancerInformation[msg.sender].email = _email;
        FreelancerInformation[msg.sender].description = _description;

        emit FreelancerUpdateData(msg.sender, _firstname, _lastname, _phone, _email, _description);
    }

    function () 
        public 
    {
        revert();
    }
}