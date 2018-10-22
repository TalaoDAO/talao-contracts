// TalaoToken, Freelancer, Vault, VaultFactory all in 1.
pragma solidity ^0.4.25;


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
    uint256 c = a / b;
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


/**
 * @title Ownable
 * @dev The Ownable contract has an owner address, and provides basic authorization control
 * functions, this simplifies the implementation of "user permissions".
 */
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
  function transferOwnership(address newOwner) public onlyOwner {
    require(newOwner != address(0));
    OwnershipTransferred(owner, newOwner);
    owner = newOwner;
  }

}


/**
 * @title ERC20Basic
 * @dev Simpler version of ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/179
 */
contract ERC20Basic {
  uint256 public totalSupply;
  function balanceOf(address who) public view returns (uint256);
  function transfer(address to, uint256 value) public returns (bool);
  event Transfer(address indexed from, address indexed to, uint256 value);
}


/**
 * @title ERC20 interface
 * @dev see https://github.com/ethereum/EIPs/issues/20
 */
contract ERC20 is ERC20Basic {
  function allowance(address owner, address spender) public view returns (uint256);
  function transferFrom(address from, address to, uint256 value) public returns (bool);
  function approve(address spender, uint256 value) public returns (bool);
  event Approval(address indexed owner, address indexed spender, uint256 value);
}


/**
 * @title SafeERC20
 * @dev Wrappers around ERC20 operations that throw on failure.
 * To use this library you can add a `using SafeERC20 for ERC20;` statement to your contract,
 * which allows you to call the safe operations as `token.safeTransfer(...)`, etc.
 */
library SafeERC20 {
  function safeTransfer(ERC20Basic token, address to, uint256 value) internal {
    assert(token.transfer(to, value));
  }

  function safeTransferFrom(ERC20 token, address from, address to, uint256 value) internal {
    assert(token.transferFrom(from, to, value));
  }

  function safeApprove(ERC20 token, address spender, uint256 value) internal {
    assert(token.approve(spender, value));
  }
}


/**
 * @title Basic token
 * @dev Basic version of StandardToken, with no allowances.
 */
contract BasicToken is ERC20Basic {
  using SafeMath for uint256;

  mapping(address => uint256) balances;

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[msg.sender]);

    // SafeMath.sub will throw if there is not enough balance.
    balances[msg.sender] = balances[msg.sender].sub(_value);
    balances[_to] = balances[_to].add(_value);
    Transfer(msg.sender, _to, _value);
    return true;
  }

  /**
  * @dev Gets the balance of the specified address.
  * @param _owner The address to query the the balance of.
  * @return An uint256 representing the amount owned by the passed address.
  */
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

}


/**
 * @title Standard ERC20 token
 *
 * @dev Implementation of the basic standard token.
 * @dev https://github.com/ethereum/EIPs/issues/20
 * @dev Based on code by FirstBlood: https://github.com/Firstbloodio/token/blob/master/smart_contract/FirstBloodToken.sol
 */
contract StandardToken is ERC20, BasicToken {

  mapping (address => mapping (address => uint256)) internal allowed;


  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));
    require(_value <= balances[_from]);
    require(_value <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_value);
    balances[_to] = balances[_to].add(_value);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_value);
    Transfer(_from, _to, _value);
    return true;
  }

  /**
   * @dev Approve the passed address to spend the specified amount of tokens on behalf of msg.sender.
   *
   * Beware that changing an allowance with this method brings the risk that someone may use both the old
   * and the new allowance by unfortunate transaction ordering. One possible solution to mitigate this
   * race condition is to first reduce the spender's allowance to 0 and set the desired value afterwards:
   * https://github.com/ethereum/EIPs/issues/20#issuecomment-263524729
   * @param _spender The address which will spend the funds.
   * @param _value The amount of tokens to be spent.
   */
  function approve(address _spender, uint256 _value) public returns (bool) {
    allowed[msg.sender][_spender] = _value;
    Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
   * @dev Function to check the amount of tokens that an owner allowed to a spender.
   * @param _owner address The address which owns the funds.
   * @param _spender address The address which will spend the funds.
   * @return A uint256 specifying the amount of tokens still available for the spender.
   */
  function allowance(address _owner, address _spender) public view returns (uint256) {
    return allowed[_owner][_spender];
  }

  /**
   * @dev Increase the amount of tokens that an owner allowed to a spender.
   *
   * approve should be called when allowed[_spender] == 0. To increment
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _addedValue The amount of tokens to increase the allowance by.
   */
  function increaseApproval(address _spender, uint _addedValue) public returns (bool) {
    allowed[msg.sender][_spender] = allowed[msg.sender][_spender].add(_addedValue);
    Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

  /**
   * @dev Decrease the amount of tokens that an owner allowed to a spender.
   *
   * approve should be called when allowed[_spender] == 0. To decrement
   * allowed value is better to use this function to avoid 2 calls (and wait until
   * the first transaction is mined)
   * From MonolithDAO Token.sol
   * @param _spender The address which will spend the funds.
   * @param _subtractedValue The amount of tokens to decrease the allowance by.
   */
  function decreaseApproval(address _spender, uint _subtractedValue) public returns (bool) {
    uint oldValue = allowed[msg.sender][_spender];
    if (_subtractedValue > oldValue) {
      allowed[msg.sender][_spender] = 0;
    } else {
      allowed[msg.sender][_spender] = oldValue.sub(_subtractedValue);
    }
    Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
    return true;
  }

}


/**
 * @title Mintable token
 * @dev Simple ERC20 Token example, with mintable token creation
 * @dev Issue: * https://github.com/OpenZeppelin/zeppelin-solidity/issues/120
 * Based on code by TokenMarketNet: https://github.com/TokenMarketNet/ico/blob/master/contracts/MintableToken.sol
 */
contract MintableToken is StandardToken, Ownable {
  event Mint(address indexed to, uint256 amount);
  event MintFinished();

  bool public mintingFinished = false;


  modifier canMint() {
    require(!mintingFinished);
    _;
  }

  /**
   * @dev Function to mint tokens
   * @param _to The address that will receive the minted tokens.
   * @param _amount The amount of tokens to mint.
   * @return A boolean that indicates if the operation was successful.
   */
  function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {
    totalSupply = totalSupply.add(_amount);
    balances[_to] = balances[_to].add(_amount);
    Mint(_to, _amount);
    Transfer(address(0), _to, _amount);
    return true;
  }

  /**
   * @dev Function to stop minting new tokens.
   * @return True if the operation was successful.
   */
  function finishMinting() onlyOwner canMint public returns (bool) {
    mintingFinished = true;
    MintFinished();
    return true;
  }
}


interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) external; }


/**
 * @title TalaoToken
 * @dev This contract details the TALAO token and allows freelancers to create/revoke vault access, appoint agents.
 * @author Blockchain Partner
 */
contract TalaoToken is MintableToken {
  using SafeMath for uint256;

  // token details
  string public constant name = "Talao";
  string public constant symbol = "TALAO";
  uint8 public constant decimals = 18;

  // the talao marketplace address
  address public marketplace;

  // talao tokens needed to create a vault
  uint256 public vaultDeposit;
  // sum of all talao tokens desposited
  uint256 public totalDeposit;

  struct FreelanceData {
      // access price to the talent vault
      uint256 accessPrice;
      // address of appointed talent agent
      address appointedAgent;
      // how much the talent is sharing with its agent
      uint sharingPlan;
      // how much is the talent deposit
      uint256 userDeposit;
  }

  // structure that defines a client access to a vault
  struct ClientAccess {
      // is he allowed to access the vault
      bool clientAgreement;
      // the block number when access was granted
      uint clientDate;
  }

  // Vault allowance client x freelancer
  mapping (address => mapping (address => ClientAccess)) public accessAllowance;

  // Freelance data is public
  mapping (address=>FreelanceData) public data;

  enum VaultStatus {Closed, Created, PriceTooHigh, NotEnoughTokensDeposited, AgentRemoved, NewAgent, NewAccess, WrongAccessPrice}

  // Those event notifies UI about vaults action with vault status
  // Closed Vault access closed
  // Created Vault access created
  // PriceTooHigh Vault access price too high
  // NotEnoughTokensDeposited not enough tokens to pay deposit
  // AgentRemoved agent removed
  // NewAgent new agent appointed
  // NewAccess vault access granted to client
  // WrongAccessPrice client not enough token to pay vault access
  event Vault(address indexed client, address indexed freelance, VaultStatus status);

  modifier onlyMintingFinished()
  {
      require(mintingFinished == true, "minting has not finished");
      _;
  }

  /**
  * @dev Let the owner set the marketplace address once minting is over
  *      Possible to do it more than once to ensure maintainability
  * @param theMarketplace the marketplace address
  **/
  function setMarketplace(address theMarketplace)
      public
      onlyMintingFinished
      onlyOwner
  {
      marketplace = theMarketplace;
  }

  /**
  * @dev Same ERC20 behavior, but require the token to be unlocked
  * @param _spender address The address that will spend the funds.
  * @param _value uint256 The amount of tokens to be spent.
  **/
  function approve(address _spender, uint256 _value)
      public
      onlyMintingFinished
      returns (bool)
  {
      return super.approve(_spender, _value);
  }

  /**
  * @dev Same ERC20 behavior, but require the token to be unlocked and sells some tokens to refill ether balance up to minBalanceForAccounts
  * @param _to address The address to transfer to.
  * @param _value uint256 The amount to be transferred.
  **/
  function transfer(address _to, uint256 _value)
      public
      onlyMintingFinished
      returns (bool result)
  {
      return super.transfer(_to, _value);
  }

  /**
  * @dev Same ERC20 behavior, but require the token to be unlocked
  * @param _from address The address which you want to send tokens from.
  * @param _to address The address which you want to transfer to.
  * @param _value uint256 the amount of tokens to be transferred.
  **/
  function transferFrom(address _from, address _to, uint256 _value)
      public
      onlyMintingFinished
      returns (bool)
  {
      return super.transferFrom(_from, _to, _value);
  }

  /**
   * @dev Set allowance for other address and notify
   *      Allows `_spender` to spend no more than `_value` tokens in your behalf, and then ping the contract about it
   * @param _spender The address authorized to spend
   * @param _value the max amount they can spend
   * @param _extraData some extra information to send to the approved contract
   */
  function approveAndCall(address _spender, uint256 _value, bytes _extraData)
      public
      onlyMintingFinished
      returns (bool)
  {
      tokenRecipient spender = tokenRecipient(_spender);
      if (approve(_spender, _value)) {
          spender.receiveApproval(msg.sender, _value, this, _extraData);
          return true;
      }
  }

  /**
   * @dev Allows the owner to withdraw ethers from the contract.
   * @param ethers quantity in weis of ethers to be withdrawn
   * @return true if withdrawal successful ; false otherwise
   */
  function withdrawEther(uint256 ethers)
      public
      onlyOwner
  {
      msg.sender.transfer(ethers);
  }

  /**
   * @dev Allow the owner to withdraw tokens from the contract without taking tokens from deposits.
   * @param tokens quantity of tokens to be withdrawn
   */
  function withdrawTalao(uint256 tokens)
      public
      onlyOwner
  {
      require(balanceOf(this).sub(totalDeposit) >= tokens, "too much tokens asked");
      _transfer(this, msg.sender, tokens);
  }

  /******************************************/
  /*      vault functions start here        */
  /******************************************/

  /**
  * @dev Allows anyone to create a vault access.
  *      Vault deposit is transferred to token contract and sum is stored in totalDeposit
  *      Price must be lower than Vault deposit
  * @param price to pay to access certificate vault
  */
  function createVaultAccess (uint256 price)
      public
      onlyMintingFinished
  {
      require(accessAllowance[msg.sender][msg.sender].clientAgreement==false, "vault already created");
      require(price<=vaultDeposit, "price asked is too high");
      require(balanceOf(msg.sender)>vaultDeposit, "user has not enough tokens to send deposit");
      data[msg.sender].accessPrice=price;
      super.transfer(this, vaultDeposit);
      totalDeposit = totalDeposit.add(vaultDeposit);
      data[msg.sender].userDeposit=vaultDeposit;
      data[msg.sender].sharingPlan=100;
      accessAllowance[msg.sender][msg.sender].clientAgreement=true;
      emit Vault(msg.sender, msg.sender, VaultStatus.Created);
  }

  /**
  * @dev Closes a vault access, deposit is sent back to freelance wallet
  *      Total deposit in token contract is reduced by user deposit
  */
  function closeVaultAccess()
      public
      onlyMintingFinished
  {
      require(accessAllowance[msg.sender][msg.sender].clientAgreement==true, "vault has not been created");
      require(_transfer(this, msg.sender, data[msg.sender].userDeposit), "token deposit transfer failed");
      accessAllowance[msg.sender][msg.sender].clientAgreement=false;
      totalDeposit=totalDeposit.sub(data[msg.sender].userDeposit);
      data[msg.sender].sharingPlan=0;
      emit Vault(msg.sender, msg.sender, VaultStatus.Closed);
  }

  /**
  * @dev Internal transfer function used to transfer tokens from an address to another without prior authorization.
  *      Only used in these situations:
  *           * Send tokens from the contract to a token buyer (buy() function)
  *           * Send tokens from the contract to the owner in order to withdraw tokens (withdrawTalao(tokens) function)
  *           * Send tokens from the contract to a user closing its vault thus claiming its deposit back (closeVaultAccess() function)
  * @param _from address The address which you want to send tokens from.
  * @param _to address The address which you want to transfer to.
  * @param _value uint256 the amount of tokens to be transferred.
  * @return true if transfer is successful ; should throw otherwise
  */
  function _transfer(address _from, address _to, uint _value)
      internal
      returns (bool)
  {
      require(_to != 0x0, "destination cannot be 0x0");
      require(balances[_from] >= _value, "not enough tokens in sender wallet");

      balances[_from] = balances[_from].sub(_value);
      balances[_to] = balances[_to].add(_value);
      emit Transfer(_from, _to, _value);
      return true;
  }

  /**
  * @dev Appoint an agent or a new agent
  *      Former agent is replaced by new agent
  *      Agent will receive token on behalf of the freelance talent
  * @param newagent agent to appoint
  * @param newplan sharing plan is %, 100 means 100% for freelance
  */
  function agentApproval (address newagent, uint newplan)
      public
      onlyMintingFinished
  {
      require(newplan>=0&&newplan<=100, "plan must be between 0 and 100");
      require(accessAllowance[msg.sender][msg.sender].clientAgreement==true, "vault has not been created");
      emit Vault(data[msg.sender].appointedAgent, msg.sender, VaultStatus.AgentRemoved);
      data[msg.sender].appointedAgent=newagent;
      data[msg.sender].sharingPlan=newplan;
      emit Vault(newagent, msg.sender, VaultStatus.NewAgent);
  }

  /**
   * @dev Set the quantity of tokens necessary for vault access creation
   * @param newdeposit deposit (in tokens) for vault access creation
   */
  function setVaultDeposit (uint newdeposit)
      public
      onlyOwner
  {
      vaultDeposit = newdeposit;
  }

  /**
  * @dev Buy unlimited access to a freelancer vault
  *      Vault access price is transfered from client to agent or freelance depending on the sharing plan
  *      Allowance is given to client and one stores block.number for future use
  * @param freelance the address of the talent
  * @return true if access is granted ; false if not
  */
  function getVaultAccess (address freelance)
      public
      onlyMintingFinished
      returns (bool)
  {
      require(accessAllowance[freelance][freelance].clientAgreement==true, "vault does not exist");
      require(accessAllowance[msg.sender][freelance].clientAgreement!=true, "access was already granted");
      require(balanceOf(msg.sender)>data[freelance].accessPrice, "user has not enough tokens to get access to vault");

      uint256 freelance_share = data[freelance].accessPrice.mul(data[freelance].sharingPlan).div(100);
      uint256 agent_share = data[freelance].accessPrice.sub(freelance_share);
      if(freelance_share>0) super.transfer(freelance, freelance_share);
      if(agent_share>0) super.transfer(data[freelance].appointedAgent, agent_share);
      accessAllowance[msg.sender][freelance].clientAgreement=true;
      accessAllowance[msg.sender][freelance].clientDate=block.number;
      emit Vault(msg.sender, freelance, VaultStatus.NewAccess);
      return true;
  }

  /**
  * @dev Simple getter to retrieve talent agent
  * @param freelance talent address
  * @return address of the agent
  **/
  function getFreelanceAgent(address freelance)
      public
      view
      returns (address)
  {
      return data[freelance].appointedAgent;
  }

  /**
  * @dev Simple getter to check if user has access to a freelance vault
  * @param freelance talent address
  * @param user user address
  * @return true if access granted or false if not
  **/
  function hasVaultAccess(address freelance, address user)
      public
      view
      returns (bool)
  {
      return ((accessAllowance[user][freelance].clientAgreement) || (data[freelance].appointedAgent == user));
  }

}


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


/**
 * @title Vault.
 * @dev A Talent's Vault.
 * @author SlowSense, Talao, Blockchain Partners.
 */
contract Vault is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Talao token contract.
    TalaoToken public myToken;

    // Freelancer contract.
    Freelancer public myFreelancer;

    // Documents counter.
    uint documentsCounter;
    // Used to parse all documents using index as relationship between this array and TalentsDocuments mapping.
    uint[] documentIndex;
    // Document struct.
    struct Document {
        // Title.
        bytes32 title;
        // Description.
        string description;
        // Timestamp of start.
        uint start;
        // Timestamp of end.
        uint end;
        // Duration in days.
        uint duration;
        // Array of keywords.
        bytes32[] keywords;
        // Type: DIPLOMA = 1, EDUCATION = 2, SKILL = 3, WORK = 4, 5 = ID
        uint doctype;
        // IPFS hash of the attached file, if any.
        bytes32 ipfs;
        // True if "published", false if "unpublished".
        bool published;
        // Position in index.
        uint index;
    }
    // Mapping: documentId => Document.
    mapping(uint => Document) public Documents;

    // Event: new document added.
    // Just because we need to get the document ID after the transaction, in the frontend.
    event NewDocument (
        uint id
    );

    /**
     * Constructor.
     */
    constructor(address _token, address _freelancer)
        public
    {
        myToken = TalaoToken(_token);
        myFreelancer = Freelancer(_freelancer);
    }

    /**
     * Modifier for functions to allow only active Freelancers.
     */
    modifier onlyActiveFreelancer () {
        // Accept only active Freelancers.
        require(myFreelancer.isActive(msg.sender), 'Sender is not active.');
        _;
    }

    /**
     * Modifier for functions to allow only users who have access to the Vault in the token + Partners.
     */
    modifier onlyVaultReaders() {
        // Sender must be set.
        require (msg.sender != address(0), 'Sender must be set.');
        // See if Vault price = 0 to allow anyone in that case.
        (uint accessPrice, address appointedAgent, uint sharingPlan, uint userDeposit) = myToken.data(owner);
        // Accept only users who have access to the Vault in the token + Partners.
        require(accessPrice == 0 || myFreelancer.isPartner(owner, msg.sender) || myToken.hasVaultAccess(msg.sender, owner), 'Sender has no Vault access.');
        _;
    }

    /**
     * @dev See if document is published.
     * @param _id uint Document ID.
     */
    function isDocPublished(uint _id)
        view
        public
        onlyVaultReaders
        returns(bool isPublished)
    {
        require(_id > 0, 'Document ID must be > 0');

        isPublished = Documents[_id].published;
    }

    /**
     * @dev Document getter.
     * @param _id uint Document ID.
     */
    function getDoc(uint _id)
        view
        public
        onlyVaultReaders
        returns (
            bytes32 title,
            string description,
            uint start,
            uint end,
            uint duration,
            bytes32[] keywords,
            uint doctype,
            bytes32 ipfs
        )
    {
        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');

        // Validate doc state.
        Document memory doc = Documents[_id];
        require(doc.published, 'Document does not exist.');

        // Return data.
        title = doc.title;
        description = doc.description;
        start = doc.start;
        end = doc.end;
        duration = doc.duration;
        keywords = doc.keywords;
        doctype = doc.doctype;
        ipfs = doc.ipfs;
    }

    /**
     * @dev Get all published documents.
     */
    function getDocs()
        view
        public
        onlyVaultReaders
        returns (uint[])
    {
        return documentIndex;
    }

    /**
     * @dev Create a document.
     */
    function createDoc(
        bytes32 _title,
        string _description,
        uint _start,
        uint _end,
        uint _duration,
        bytes32[] _keywords,
        uint _doctype,
        bytes32 _ipfs
    )
        public
        onlyOwner
        onlyActiveFreelancer
        returns (uint)
    {
        // Validate parameters.
        require(_title != 0, 'Title can not be empty.');
        require(_doctype > 0, 'Type must be > 0.');

        // Increment documents counter.
        documentsCounter = documentsCounter.add(1);

        // Write document data.
        Document storage doc = Documents[documentsCounter];
        doc.title = _title;
        doc.description = _description;
        doc.start = _start;
        doc.end = _end;
        doc.duration = _duration;
        doc.keywords = _keywords;
        doc.doctype = _doctype;
        doc.ipfs = _ipfs;
        doc.published = true;
        doc.index = documentIndex.push(documentsCounter).sub(1);

        // Emit event.
        emit NewDocument(
            documentsCounter
        );

        return documentsCounter;
    }

    /**
     * @dev Set an IPFS hash of an IPFS uploaded file, to attach it.
     * @param _id uint Document ID.
     * @param _ipfs bytes32 IPFS hash of the file.
     */
    function setDocIpfs(
        uint _id,
        bytes32 _ipfs
    )
        public
        onlyOwner
        onlyActiveFreelancer
    {
        // Validate parameters.
        require(_id > 0, 'Document ID must be > 0.');
        require(_ipfs != 0, 'IPFS hash can not be empty.');

        // Validate doc state.
        Document storage doc = Documents[_id];
        require (doc.published, 'IPFS files can be attached only to published documents.');

        // Write data.
        doc.ipfs = _ipfs;
    }

    /**
     * @dev Remove a document.
     */
    function deleteDoc (uint _id)
        public
        onlyOwner
        onlyActiveFreelancer
    {
        // Validate parameter.
        require (_id > 0, 'Document ID must be > 0.');

        // Validate state.
        Document storage docToDelete = Documents[_id];
        require (docToDelete.published, 'Only published documents can be removed.');

        /**
         * Remove document from index.
         */

        // If the removed document is not the last in the index,
        if (docToDelete.index < (documentIndex.length - 1)) {
          // Find the last document of the index.
          uint lastDocId = documentIndex[(documentIndex.length - 1)];
          Document storage lastDoc = Documents[lastDocId];
          // Move it in the index in place of the document to delete.
          documentIndex[docToDelete.index] = lastDocId;
          // Update this document that was moved from last position.
          lastDoc.index = docToDelete.index;
        }
        // Remove last element from index.
        documentIndex.length --;
        // Unpublish document.
        docToDelete.published = false;
    }

    /**
     * @dev Prevents accidental sending of ether.
     */
    function ()
        public
    {
        revert();
    }
}


/**
 * @title VaultFactory
 * @dev This contract is a factory of Vault contracts.
 * @author Talao, Slowsense, Blockchain Partner.
 */
contract VaultFactory is Ownable {

    // SafeMath to avoid overflows.
    using SafeMath for uint;

    // Number of Vaults.
    uint public vaultsNb;
    // Talao token.
    TalaoToken myToken;
    // Freelancer contract to store freelancers information.
    Freelancer myFreelancer;

    // First address is the freelance Ethereum address.
    // Second address is the freelance's Vault smart contract address.
    mapping (address => address) FreelancesVaults;

    enum VaultState { AccessDenied, AlreadyExist, Created }

    // Talao token smart contract address.
    constructor(address _token, address _freelancer)
        public
    {
        myToken = TalaoToken(_token);
        myFreelancer = Freelancer(_freelancer);
    }

    /**
     * @dev Getter to see if a freelance has a Vault.
     */
    function hasVault (address _freelance)
        public
        view
        returns (bool hasvault)
    {
        address freelanceVault = FreelancesVaults[_freelance];
        if(freelanceVault != address(0)) {
            hasvault = true;
        }
    }

    /**
     * @dev Get the freelance's Vault address, if authorized.
     */
    function getVault(address freelance)
        public
        view
        returns (address)
    {
        // Tupple used for data.
        uint256 accessPrice;
        address appointedAgent;
        uint sharingPlan;
        uint256 userDeposit;

        (accessPrice, appointedAgent, sharingPlan, userDeposit) = myToken.data(freelance);

        if (accessPrice <= 0) {
            return FreelancesVaults[freelance];
        }

        if (msg.sender != address(0)) {
            bool hasAccess = myToken.hasVaultAccess(freelance, msg.sender);
            bool isPartner = myFreelancer.isPartner(freelance, msg.sender);
            bool isTalaoBot = myFreelancer.isTalaoBot(msg.sender);

            if (hasAccess || isPartner || isTalaoBot) {
                return FreelancesVaults[freelance];
            }
        }

        return address(0);
    }

    /**
     * @dev Talent can call this method to create a new Vault contract with the maker being the owner of this new Vault.
     */
    function createVaultContract (
        bytes32 _firstname,
        bytes32 _lastname,
        bytes32 _mobile,
        bytes32 _email,
        bytes32 _title,
        string _description,
        bytes32 _picture
    )
        public
        returns (address)
    {
        // Sender must have access to his Vault in the Token.
        require(myToken.hasVaultAccess(msg.sender, msg.sender), 'Sender has no access to Vault.');

        // Set Freelancer information.
        myFreelancer.setFreelancer(msg.sender, _firstname, _lastname, _mobile, _email, _title, _description, _picture);
        // Create Vault.
        Vault newVault = new Vault(myToken, myFreelancer);
        // Index Vault.
        FreelancesVaults[msg.sender] = address(newVault);
        // Transfer Vault to Freelancer.
        newVault.transferOwnership(msg.sender);
        // Increment total number of Vaults.
        vaultsNb = vaultsNb.add(1);

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
