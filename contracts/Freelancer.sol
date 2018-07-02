pragma solidity ^0.4.23;

import "./Talao.sol";

contract Freelancer is Ownable {

    // TODO A modifier en mode token

    TalaoToken myToken;
    
    struct Information {
        // public freelancer data
        bytes32 firstName;
        bytes32 lastName;
        bytes32 mobilePhone;
        bytes32 email;
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

    event FreelancerSubscribe (
        address indexed freelancer,
        bytes32 firstname,
        bytes32 lastname,
        bytes32 phone,
        bytes32 email
    );

    event FreelancerInternalData (
        address indexed freelancer,
        bool IsKYC,
        uint referral
    );

    constructor(address token) 
        public 
    {
        myToken = TalaoToken(token);
        FreelancerInformation[msg.sender].karma = 1;
    }

    /**
     * Freelance subscribes/updates his data
    */
    function subscribe(bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email)
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

        emit FreelancerSubscribe(msg.sender, _firstname, _lastname, _phone, _email);
    }
    /**
     * General Data Protection Regulation
     * Freelancer unsubscribes
     */
    function unsubscribe()
        onlyOwner
        public
    {
        require(FreelancerInformation[msg.sender].state != FreelancerState.Inactive);
        delete FreelancerInformation[msg.sender];
    }
    
    /**
     * Only Owner can set internal freelance data
     * Talao can suspend one freelance
    */
    function setInternalData(bool _iskyc, uint8 _referral) 
        onlyOwner
        public
    {
        require (FreelancerInformation[msg.sender].state != FreelancerState.Inactive);
        FreelancerInformation[msg.sender].isUserKYC = _iskyc;
        FreelancerInformation[msg.sender].referral = _referral;
        emit FreelancerInternalData(msg.sender, _iskyc, _referral);
    }   
    /**
     * Set Confidence Index (public data) by owner in case of bad behavior) 
     */
    function setKarma(uint256 karma)
        onlyOwner
        public
    {
        require(FreelancerInformation[msg.sender].state == FreelancerState.Active);
        FreelancerInformation[msg.sender].karma = karma;
    }

    function setInactive()
        onlyOwner
        public
    {
        FreelancerInformation[msg.sender].state = FreelancerState.Inactive;
    }

    function setActive()
        onlyOwner
        public
    {
        FreelancerInformation[msg.sender].state = FreelancerState.Active;
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

    function isPartner(address _partner)
        public
        view
        returns(bool)
    {
        return ListedPartner[owner][_partner];
    }
}