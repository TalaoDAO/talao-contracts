pragma solidity ^0.4.24;

import './Talao.sol';

/**
 * @title Freelancer.
 * @dev Talao Freelancers.
 * @author Talao, SlowSense, Blockchain Partners.
 */
contract Freelancer is Ownable {

    TalaoToken myToken;

    /*
     * Inactive = Freelance does not exist or has deleted his data.
     * Active = Freelance is active.
     * Suspended = Talao suspended this account.
     */
    enum FreelancerState { Inactive, Active, Suspended }

    // Struct of a Freelancer information.
    struct FreelancerInformation {
        bytes32 firstname;
        bytes32 lastname;
        bytes32 mobile;
        bytes32 email;
        bytes32 title;
        string description;
        bytes32 picture;
        FreelancerState state;
        uint subscription;
    }
    // Mapping of Freelancers Ethereum addresses => Freelancer information. TODO: put in private and use getFreelancer?
    mapping (address => FreelancerInformation) public Freelancers;

    // Mapping of Freelancers Ethereum addresses => mapping of Partners Ethereum addresses => bool (Partners of each Freelancer).
    mapping (address => mapping (address => bool)) public Partners;

    // Address of the Talao Bot. He can get the Vault addresses of the Freelancers, but not the Vaults content.
    address TalaoBot;

    constructor(address _token)
        public
    {
        myToken = TalaoToken(_token);
    }

    /**
     * @dev Get Freelancer data.
    */
    function getFreelancer(address _freelancer)
        public
        view
        returns (
          bytes32 firstname,
          bytes32 lastname,
          bytes32 mobile,
          bytes32 email,
          bytes32 title,
          string description,
          bytes32 picture,
          bool active,
          uint subscription
        )
    {
        FreelancerInformation memory thisFreelancer = Freelancers[_freelancer];

        // Not for inactive Freelancers.
        require (thisFreelancer.state != FreelancerState.Inactive, 'Inactive Freelancer have no information to get.');

        firstname = thisFreelancer.firstname;
        lastname = thisFreelancer.lastname;
        mobile = thisFreelancer.mobile;
        email = thisFreelancer.email;
        title = thisFreelancer.title;
        description = thisFreelancer.description;
        picture = thisFreelancer.picture;
        if (thisFreelancer.state == FreelancerState.Active) {
          active = true;
        }
        subscription = thisFreelancer.subscription;
    }

    /**
     * @dev Getter to see if Freelancer is active.
     */
    function isActive(address _freelancer)
        public
        view
        returns (bool active)
    {
      if (Freelancers[_freelancer].state == FreelancerState.Active) {
          active = true;
      }
    }

    /**
     * @dev Getter to see if an address is a Partner.
     */
    function isPartner(address _freelancer, address _partner)
        public
        view
        returns (bool partner)
    {
        partner = Partners[_freelancer][_partner];
    }

    /**
     * @dev Is an address the Talao Bot?
     */
    function isTalaoBot(address _address)
        public
        view
        returns (bool talaoBot)
    {
        if (TalaoBot == _address) {
            talaoBot = true;
        }
    }

    /**
     * @dev Freelance subscribes/updates his data.
    */
    function setFreelancer(
        address _freelancer,
        bytes32 _firstname,
        bytes32 _lastname,
        bytes32 _mobile,
        bytes32 _email,
        bytes32 _title,
        string _description,
        bytes32 _picture
    )
        public
    {
        FreelancerInformation storage thisFreelancer = Freelancers[_freelancer];
        // Not for suspended Freelancers.
        require(thisFreelancer.state != FreelancerState.Suspended, 'Impossible, this Freelancer was suspended.');

        // Set Freelancer data.
        // New or returning Freelancer.
        if (thisFreelancer.state == FreelancerState.Inactive) {
            thisFreelancer.subscription = now;
        }
        // All.
        thisFreelancer.firstname = _firstname;
        thisFreelancer.lastname = _lastname;
        thisFreelancer.mobile = _mobile;
        thisFreelancer.email = _email;
        thisFreelancer.title = _title;
        thisFreelancer.description = _description;
        thisFreelancer.state = FreelancerState.Active;
        thisFreelancer.picture = _picture;
    }

    /**
     * @dev General Data Protection Regulation : Freelancer unsubscribes.
     */
    function unsubscribe()
        public
    {
        // Inactive Freelancers never existed or already unsubscribed.
        require(Freelancers[msg.sender].state != FreelancerState.Inactive, 'Freelancer is already inactive.');

        // Remove data.
        delete Freelancers[msg.sender];
    }

    /**
     * @dev Freelancer can add or remove a Partner. Partner will have a free access to his Vault.
     */
    function setPartner(address _partner, bool _ispartner)
        public
    {
        Partners[msg.sender][_partner] = _ispartner;
    }

    /**
     * @dev Owner can activate Freelancer.
     */
    function setActive(address _freelancer)
        public
        onlyOwner
    {
        Freelancers[_freelancer].state = FreelancerState.Active;
    }

    /**
     * @dev Owner can suspend Freelancer.
     */
    function setSuspended(address _freelancer)
        public
        onlyOwner
    {
        Freelancers[_freelancer].state = FreelancerState.Suspended;
    }

    /**
     * @dev Get the Talao Bot address.
     */
    function getTalaoBot()
        public
        onlyOwner
        view
        returns (address)
    {
        return TalaoBot;
    }

    /**
     * @dev Set the Talao Bot Ethereum address.
     * He can get the Vault addresses of the Freelancers, but not the Vaults content.
     */
    function setTalaoBot(address _talaobot)
        public
        onlyOwner
    {
        TalaoBot = _talaobot;
    }
}
