pragma solidity ^0.4.23;

import "./Talao.sol";

contract Freelancer is Ownable {

    TalaoToken myToken;

    struct Information {
        // public freelancer data
        bytes32 firstName;
        bytes32 lastName;
        bytes32 mobilePhone;
        bytes32 email;
        bytes32 title;
        string description;
        bytes32 picture;
        FreelancerState state;

        bool isUserKYC;
        // this is the origin of the freelance for future use
        uint8 referral;
        uint256 subscriptionDate;

    }

    // mapping between Vault Ethereum address and Confidence Index
    mapping(address => Information) public FreelancerInformation;

    //whitelisted address of partners to get a free access to vault
    mapping(address => mapping(address=>bool)) public ListedPartner;

    /*
     * Innactive = Freelance has desactited his data
     * Active = Freelance data are accessible
     * Suspended = Another one person has deactvited data for this freelancer
     */
    enum FreelancerState { Inactive, Active, Suspended }

    event FreelancerUpdateData (
        address indexed freelancer,
        bytes32 firstname,
        bytes32 lastname,
        bytes32 phone,
        bytes32 email,
        bytes32 title,
        string description,
        bytes32 picture
    );

    event FreelancerInternalData (
        address indexed freelancer,
        bool IsKYC,
        uint referral
    );

    // Address of the Talao Admin. He has the power to get for free the Vault adress of a freelance.
    address TalaoAdmin;

    constructor(address token)
        public
    {
        myToken = TalaoToken(token);
    }

    /**
     * Freelance subscribes/updates his data
    */
    function UpdateFreelancerData(address _faddress,bytes32 _firstname,bytes32 _lastname,bytes32 _phone,bytes32 _email,bytes32 _title,string _desc, bytes32 _picture)
        public
    {
        require(FreelancerInformation[_faddress].state != FreelancerState.Suspended,"Freelancer is suspended");
        if (FreelancerInformation[_faddress].state == FreelancerState.Inactive)
        {
            FreelancerInformation[_faddress].subscriptionDate = now;
        }
        FreelancerInformation[_faddress].firstName = _firstname;
        FreelancerInformation[_faddress].lastName = _lastname;
        FreelancerInformation[_faddress].mobilePhone = _phone;
        FreelancerInformation[_faddress].email = _email;
        FreelancerInformation[_faddress].title = _title;
        FreelancerInformation[_faddress].description = _desc;
        FreelancerInformation[_faddress].picture = _picture;

        emit FreelancerUpdateData(_faddress, _firstname, _lastname, _phone, _email, _title, _desc, _picture);
    }

    /**
     * General Data Protection Regulation
     * Freelancer unsubscribes
     */
    function unsubscribe()
        public
    {
        require(FreelancerInformation[msg.sender].state != FreelancerState.Inactive, "this freelance is inactive");
        delete FreelancerInformation[msg.sender];
    }

    /**
     * Only Owner can set internal freelance data
     * Talao can suspend one freelance
    */
    function setInternalData(bool _iskyc, uint8 _referral)
        public
    {
        require (FreelancerInformation[msg.sender].state != FreelancerState.Inactive,"this freelance is inactive" );
        FreelancerInformation[msg.sender].isUserKYC = _iskyc;
        FreelancerInformation[msg.sender].referral = _referral;
        emit FreelancerInternalData(msg.sender, _iskyc, _referral);
    }

    function setInactive(address _freelancer)
        onlyOwner
        public
    {
        FreelancerInformation[_freelancer].state = FreelancerState.Inactive;
    }

    function setActive(address _freelancer)
        onlyOwner
        public
    {
        FreelancerInformation[_freelancer].state = FreelancerState.Active;
    }

    /**
     * Freelance can whitelist a partner. Partner will have a free access to his Vault
    */
    function listPartner(address _partner, bool IsListed)
        public
    {
        ListedPartner[msg.sender][_partner] = IsListed;
    }

    function isPartner(address _freelancer, address _partner)
        public
        view
        returns(bool)
    {
        return ListedPartner[_freelancer][_partner];
    }

    /**
     * @dev Set the Talao Admin ethereum address.
     * He has the power to get for free the Vault adress of a freelance.
     */
    function setTalaoAdmin(address _talaoadmin)
        onlyOwner
        public
    {
        TalaoAdmin = _talaoadmin;
    }

    function isTalaoAdmin(address _user)
        public
        view
        returns (bool)
    {
        bool isAdmin;
        if (TalaoAdmin == _user) {
          isAdmin = true;
        }
        return isAdmin;
    }

    /**
     * @dev Get the Talao Admin ethereum address.
     */
    function getTalaoAdmin()
        onlyOwner
        public
        constant
        returns (address)
    {
        return TalaoAdmin;
    }
}
