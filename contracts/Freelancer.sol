pragma solidity ^0.4.23;

import "./Talao.sol";
import "./Vault.sol";

contract Freelancer is Ownable {

    TalaoToken myToken;

    constructor(address token)
        public 
    {
        myToken = TalaoToken(token);
    }
    
    // Nb of criterias rated by client
    uint8 public constant maxCriteria = 5;
    // Nb ratings taking into account for confidence index
    uint8 public constant maxRating = 4;
    
    enum FreelancerState { Inactive, Active, Suspended }
    
    struct InternalVaultData {
        // Inactive, Active or Suspended, init by default 0 -> do not replace by enum 
        FreelancerState userState;
        bool isUserKYC;
        // this is the origin of the freelance for future use
        uint8 referral;
        uint256 subscriptionDate; 
    }
    
    struct PublicVaultData {
        // public freelancer data
        bytes32 firstName;
        bytes32 lastName;
        bytes32 mobilePhone;
        bytes32 email;
        bytes32 otherSocialMedia;
        
        //Confidence Index starts here
        bool isVerified;
        bool isMobilephone;
        bool isEmail;
        uint8 nbEducations;
        uint8 nbExperiences;
        uint8 nbSkills;
        uint8 nbLanguages;
    }

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
        uint8 referral
    );
     
    // mapping between[{]_parter freelancer Ethereum address and his data
    mapping (address => InternalVaultData) private InternalData;   
    // mapping between Vault Ethereum address and Confidence Index
    mapping (address => PublicVaultData) public PublicData;
  
    /**
     * Freelance subscribes/updates his data
    */
    function Subscribe(bytes32 _firstname, bytes32 _lastname, bytes32 _phone, bytes32 _email, bytes32 _othersocialmedia)
        onlyOwner
        public
    {
        require(InternalData[msg.sender].userState != FreelancerState.Suspended);
        if (InternalData[msg.sender].userState == FreelancerState.Inactive)
        {
            InternalData[msg.sender].subscriptionDate = now;
        }
        InternalData[msg.sender].userState == FreelancerState.Active;
        PublicData[msg.sender].firstName = _firstname;
        PublicData[msg.sender].lastName = _lastname;
        PublicData[msg.sender].mobilePhone = _phone;
        PublicData[msg.sender].email = _email;
        PublicData[msg.sender].otherSocialMedia = _othersocialmedia;

        emit FreelancerSubscribe(msg.sender, _firstname, _lastname, _phone, _email);
    }
    /**
     * General Data Protection Regulation
     * Freelancer unsubscribes
     */
    function Unsubscribe()
        onlyOwner
        public
    {
        require(InternalData[msg.sender].userState != FreelancerState.Inactive);
        delete InternalData[msg.sender];
        delete PublicData[msg.sender];
    }
    /**
     * Only Owner can set internal freelance data
     * Talao can suspend one freelance
    */
    function setInternalData(bool _iskyc, uint8 _referral) 
        onlyOwner
        public
    {
        require (InternalData[msg.sender].userState != FreelancerState.Inactive);
        InternalData[msg.sender].isUserKYC = _iskyc;
        InternalData[msg.sender].referral = _referral;
        emit FreelancerInternalData(msg.sender, _iskyc, _referral);
    }   
    /**
     * Set Confidence Index (public data) by owner in case of bad behavior) 
     */
    function setConfidenceIndex(
        bool isVerified, bool isPhone, bool isEmail,
        uint8 nbEducations, uint8 nbExperiences, uint8 nbSkills, uint8 nbLanguages
    )
        onlyOwner 
        public
    {
        require(InternalData[msg.sender].userState == FreelancerState.Active);
        PublicData[msg.sender].isVerified = isVerified;
        PublicData[msg.sender].isMobilephone = isPhone;
        PublicData[msg.sender].isEmail = isEmail;
        PublicData[msg.sender].nbEducations = nbEducations;
        PublicData[msg.sender].nbExperiences = nbExperiences;
        PublicData[msg.sender].nbSkills = nbSkills;
        PublicData[msg.sender].nbLanguages = nbLanguages;
    }

    function setInactive()
        onlyOwner
        public
    {
        InternalData[msg.sender].userState = FreelancerState.Inactive;
    }

    function setActive()
        onlyOwner
        public
    {
        InternalData[msg.sender].userState = FreelancerState.Active;
    }
}