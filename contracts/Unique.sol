pragma solidity ^0.4.21;

/**
 * @title SafeMath
 * @dev Math operations with safety checks that throw on error
 */
library SafeMath {
    function mul(uint256 a, uint256 b) internal pure returns (uint256) {
        if (a == 0) {
            return 0;
        }
        uint256 c = a * b;
        assert(c / a == b);
        return c;
    }

    function div(uint256 a, uint256 b) internal pure returns (uint256) {
        // assert(b > 0); // Solidity automatically throws when dividing by 0
        uint256 c = a / b;
        // assert(a == b * c + a % b); // There is no case in which this doesn't hold
        return c;
    }

    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
        assert(b <= a);
        return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
        uint256 c = a + b;
        assert(c >= a);
        return c;
    }
}

contract TalaoToken {

    function AccessAllowance(address _owner, address _spender) 
        public 
        view 
        returns (bool,uint) 
    {
        return (true,1);
    }

}

contract Ownable {
    address public owner;


    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);


    /**
    * @dev The Ownable constructor sets the original `owner` of the contract to the sender
    * account.
    */
    function Ownable() public {
        owner = msg.sender;
    }


    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


    /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param newOwner The address to transfer ownership to.
    */
    function transferOwnership(address newOwner) 
        public 
        onlyOwner 
    {
        require(newOwner != address(0));
        //OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}

contract VaultFactory is Ownable {
    uint public nbVault;
    TalaoToken myToken;

    //first address is Talent ethereum address 
    //second address is Smart Contract vault address dedicated to this talent
    mapping (address=>address) public FreelanceVault; 

    enum VaultState { AccessDenied, AlreadyExist, Created }
    event VaultCreation(address indexed talent, address vaultadddress, VaultState msg);

    //address du smart contract token
    function VaultFactory(address token) 
        public 
    {
        myToken = TalaoToken(token);
    }

    function getMyToken() 
        public
        returns (address)
    {
        SafeMath.add(nbVault,1);
        return myToken;
    }

    function getNbVault()
        public
        view
        returns(uint)
    {
        return nbVault;
    }

    /**
     * Talent can call this method to create a new Vault contract
     *  with the maker being the owner of this new vault
     */
    function CreateVaultContract ()
        public
        returns(address)
    {
        //Verify using Talao token if sender is authorized to create a Vault
        bool agreement = false;
        uint unused = 0;
        (agreement, unused) = myToken.AccessAllowance(msg.sender,msg.sender);

        require (agreement == true);
        require(FreelanceVault[msg.sender] != address(0));

        Vault newVault = new Vault(myToken);
        FreelanceVault[msg.sender] = address(newVault);
        SafeMath.add(nbVault,1);
        newVault.transferOwnership(msg.sender);
        
        emit VaultCreation(msg.sender, newVault, VaultState.Created);

        return address(newVault);
    }

    /**
     * Prevents accidental sending of ether to the factory
     */
    function () 
        public 
    {
        revert();
    }
}

contract Vault is Ownable {
    using SafeMath for uint;

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
    mapping(bytes32 => certifiedDocument) public talentsDocuments;

    enum VaultLife { AccessDenied, DocumentAdded, DocumentRemoved, keywordAdded }

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

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function Vault(address token) 
        public 
    {
        myToken = TalaoToken(token);
    }

    /*
    add new certification document to Talent Vault
    accessibility : only for authorized user and owner of this contract
    */
    function addDocument(bytes32 documentId, bytes32 description, bytes32 keyword) 
        onlyOwner 
        allowance 
        public 
        returns (bool)
    {
        require(documentId != 0 && keyword.length != 0);
        require(!talentsDocuments[documentId].isAlive);
        SafeMath.add(NbOfValidDocument,1);

        talentsDocuments[documentId].description = description;
        talentsDocuments[documentId].isAlive = true;
        talentsDocuments[documentId].index = documentIndex.push(documentId)-1;
        talentsDocuments[documentId].keywords.push(keyword);

        emit VaultLog(msg.sender, VaultLife.DocumentAdded, documentId);

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
    get a Keywords number to allow clients to loop on each keywords
    accessibility : only for authorized user
    */
    function getKeywordsNumber(bytes32 documentId)
        allowance
        constant
        public
        returns (uint)
    {
        require(documentId != 0);
        return talentsDocuments[documentId].keywords.length;
    }

    /*
    get a Keywords using index
    accessibility : only for authorized user
    */
    function getKeywordsByIndex(bytes32 documentId, uint index)
        allowance
        constant
        public
        returns (bytes32)
    {
        require(documentId != 0);
        return talentsDocuments[documentId].keywords[index];
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
        require(documentId != 0 && talentsDocuments[documentId].isAlive == true);
        return (documentId, talentsDocuments[documentId].description, talentsDocuments[documentId].keywords.length);
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
        return (dId, talentsDocuments[dId].description, talentsDocuments[dId].keywords.length);
    }

    /*
    get list of interestng document based on search keyword
    accessibility : only for authorized user
    */
    function getMatchCertifiedDocument (uint index, bytes32 keyword)
        allowance
        constant
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

    function () 
        public 
    {
        revert();
    }
}