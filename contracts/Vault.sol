pragma solidity ^0.4.21;

//import "./MainContracts.sol";
import "./TestContract.sol";

contract Vault is Ownable {
    uint NbOfValidDocument;
    TalaoToken myToken;

    struct certifiedDocument {
        bytes32 description; //description of document
        bytes32[] keywords; //list of keywords associated to the current certified document
        bool isAlive; //true if this stuct is set, fasle else
        uint index; //index used in relationship between tabindex and mapping unordered object
    }

    //Used to parse all documents using index as relationship between this array and TalentsDocuments mapping
    bytes32[] documentIndex;

    //address is owner of document
    //Certified
    mapping(bytes32 => certifiedDocument) public Talentsdocuments;

    enum VaultLife { AccessDenied, DocumentAdded, DocumentRemoved }

    event VaultLog (
        address indexed user, 
        VaultLife happened,
        bytes32 documentId
    );

    modifier allowance () { //require sur l'aggreement
        bool agreement = false;
        uint unused = 0;
        (agreement, unused) = myToken.AccessAllowance(msg.sender,msg.sender);
        require(agreement == true);
        _;
    }

    //constructor
    function Vault(address token) 
    public 
    {
        myToken = TalaoToken(token);
    }

    // add new certification document to Talent Vault
    // accessible only for the owner and if authorized
    function AddDocument(bytes32 documentId, bytes32 description, bytes32 keyword) 
    onlyOwner 
    allowance 
    public 
    returns (bool)
    {
        require(documentId != 0 && keyword.length != 0);
        require(!Talentsdocuments[documentId].isAlive);
        NbOfValidDocument++;

        Talentsdocuments[documentId].description = description;
        Talentsdocuments[documentId].isAlive = true;
        Talentsdocuments[documentId].index = documentIndex.push(documentId)-1;
        Talentsdocuments[documentId].keywords.push(keyword);

        emit VaultLog(msg.sender, VaultLife.DocumentAdded, documentId);

        return true;
    }

    function AddKeyword(bytes32 documentId,bytes32 keyword)
    onlyOwner
    allowance
    public
    returns (bool)
    {
        require(documentId != 0 && keyword.length != 0);
        require(Talentsdocuments[documentId].isAlive);

        Talentsdocuments[documentId].keywords.push(keyword);
        return true;
    }

    // Remove existing document using document id
    // accessible only for the owner and authorized user
    function RemoveDocument (bytes32 documentId) 
    onlyOwner 
    allowance 
    public returns (bool) 
    {
        require(documentId != 0);
        if(Talentsdocuments[documentId].description.length != 0) {
            NbOfValidDocument--;
            delete Talentsdocuments[documentId]; //set isValid to false
            emit VaultLog(msg.sender, VaultLife.DocumentRemoved, documentId);
        }
    }

    function getKeywordsNumber(bytes32 documentId)
    allowance
    constant
    public
    returns (uint)
    {
        require(documentId != 0);
        return Talentsdocuments[documentId].keywords.length;
    }

    function getKeywordsByIndex(bytes32 documentId, uint index)
    allowance
    constant
    public
    returns (bytes32)
    {
        require(documentId != 0);
        return Talentsdocuments[documentId].keywords[index];
    }

    /*
    this method allows the client to retrieve a specific certified document data
    using document Id provided by ethereum when a document is uploaded
    accessibility : only for authorized user
    */
    function getCertifiedDocumentById (bytes32 documentId) 
    allowance 
    public
    constant 
    returns (bytes32 docId, bytes32 desc, uint keywordNumber) 
    {
        require(documentId != 0 && Talentsdocuments[documentId].isAlive == true);

        return (documentId, Talentsdocuments[documentId].description, Talentsdocuments[documentId].keywords.length);
    }

    /*
    This method allows the client to retrieve the list of documents (documents by documents) by browsing it with his index
    accessibility : only for authorized user
    */
    function getCertifiedDocumentsByIndex (uint index)
    allowance
    constant
    public
    returns (bytes32 docId, bytes32 desc, uint keywordNumber)
    {
        bytes32 dId = documentIndex[index];
        return (dId, Talentsdocuments[dId].description, Talentsdocuments[dId].keywords.length);
    }

    //get list of interestng document based on search keyword
    //accessible only for authorized user
    function getMatchCertifiedDocument (uint index, bytes32 keyword)
    allowance
    constant
    public
    returns(bytes32 docId, bytes32 desc)
    {
        bytes32 dId = documentIndex[index];
        bytes32 valueFounded;
        for (uint i = 0; i < Talentsdocuments[dId].keywords.length; i++) {
            valueFounded = Talentsdocuments[dId].keywords[i];
            if(keccak256(valueFounded) == keccak256(keyword)){
                return (dId, Talentsdocuments[dId].description);  
            }
        }
    }
}