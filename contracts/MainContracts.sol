pragma solidity ^0.4.18;

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
        emit Transfer(msg.sender, _to, _value);
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
        emit Transfer(_from, _to, _value);
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
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
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
        emit Approval(msg.sender, _spender, allowed[msg.sender][_spender]);
        return true;
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



interface tokenRecipient { function receiveApproval(address _from, uint256 _value, address _token, bytes _extraData) public; }

/**
 * @title TalaoCrowdsale
 * @dev This contract details the TALAO token and allows freelancers to create/revoke vault access, appoint agents.
 *      This contract also implements a marketplace to buy and sell on-chain TALAO tokens.
 * @author Blockchain Partner
 */
contract TalaoToken is MintableToken {
    using SafeMath for uint256;

    // token details
    string public constant name = "Talao";
    string public constant symbol = "TALAO";
    uint8 public constant decimals = 18;

    // vault details
    uint256 public vaultDeposit;
    uint256 public totalDeposit;

    struct FreelanceData {
        uint256 accessPrice;
        address appointedAgent;
        uint sharingPlan;
        uint256 userDeposit;
    }

    struct ClientAccess {
        bool clientAgreement;
        uint clientDate;
    }

    struct MarketplaceData {
        uint buyPrice;
        uint sellPrice;
        uint unitPrice;
    }

    // Vault allowance client x freelancer
    mapping (address => mapping (address => ClientAccess)) public AccessAllowance;

    // Freelance data is public
    mapping (address=>FreelanceData) public Data;

    //MarketplaceData
    MarketplaceData public marketplace;

    // balance eligible for refunds
    uint256 public minBalanceForAccounts;

  // Those event notifies UI about vaults action with msg code
  // msg = 0 Vault access closed
  // msg = 1 Vault access created
  // msg = 2 Vault access price too high
  // msg = 3 not enough tokens to pay deposit
  // msg = 4 agent removed
  // msg = 5 new agent appointed
  // msg = 6 vault access granted to client
  // msg = 7 client not enough token to pay vault access
    event Vault(address indexed client, address indexed freelance, uint msg);
    event SellingPrice(uint sellingPrice);
    event TalaoBought(address buyer, uint amount, uint price, uint unitPrice);
    event TalaoSold(address seller, uint amount, uint price, uint unitPrice);

    modifier onlyMintingFinished()
    {
        require(mintingFinished == true);
        _;
    }

    function TalaoToken()
        public
    {
        setMinBalance(5000000000000000 wei);
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
        result = super.transfer(_to, _value);
        if((msg.sender.balance <= minBalanceForAccounts) && result) {
            uint amount = minBalanceForAccounts.sub(msg.sender.balance).mul(marketplace.unitPrice).div(marketplace.sellPrice);
            require(balanceOf(msg.sender) >= amount);
            super.transfer(this, amount);
            uint revenue = amount.mul(marketplace.sellPrice).div(marketplace.unitPrice);
            msg.sender.transfer(revenue);
        }
        return result;
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
   * @dev Set the balance eligible for refills
   * @param weis the balance in weis
   */
    function setMinBalance(uint256 weis)
        public
        onlyOwner
    {
        minBalanceForAccounts = weis;
    }

  /**
  * @dev Allow users to buy tokens for `newBuyPrice` eth and sell tokens for `newSellPrice` eth
  * @param newSellPrice price the users can sell to the contract
  * @param newBuyPrice price users can buy from the contract
  * @param newUnitPrice to manage decimal issue 0,35 = 35 /100 (100 is unit)
  */
    function setPrices(uint256 newSellPrice, uint256 newBuyPrice, uint256 newUnitPrice)
        public
        onlyOwner
    {
        require (newSellPrice > 0 && newBuyPrice > 0 && newUnitPrice > 0);
        marketplace.sellPrice = newSellPrice;
        marketplace.buyPrice = newBuyPrice;
        marketplace.unitPrice = newUnitPrice;
    }

  /**
  * @dev Allow anyone to buy tokens against ether, depending on the buyPrice set by the contract owner.
  * @return amount the amount of tokens bought
  **/
    function buy()
        public
        payable
        onlyMintingFinished
        returns (uint amount)
    {
        amount = msg.value.mul(marketplace.unitPrice).div(marketplace.buyPrice);
        require(balanceOf(this).sub(totalDeposit) >= amount);
        _transfer(this, msg.sender, amount);
        TalaoBought(msg.sender, amount, marketplace.buyPrice, marketplace.unitPrice);
        return amount;
    }

  /**
  * @dev Allow anyone to sell tokens for ether, depending on the sellPrice set by the contract owner.
  * @param amount the number of tokens to be sold
  * @return revenue ethers sent in return
  **/
    function sell(uint amount)
        public
        onlyMintingFinished
        returns (uint revenue)
    {
        require(balanceOf(msg.sender) >= amount);
        super.transfer(this, amount);
        revenue = amount.mul(marketplace.sellPrice).div(marketplace.unitPrice);
        msg.sender.transfer(revenue);
        TalaoSold(msg.sender, amount, marketplace.sellPrice, marketplace.unitPrice);
        return revenue;
    }

  /**
   * @dev Allows the owner to withdraw ethers from the contract.
   * @param ethers quantity of ethers to be withdrawn
   * @return true if withdrawal successful ; false otherwise
   */
    function withdrawEther(uint256 ethers)
        public
        onlyOwner
    {
        if (this.balance >= ethers) {
            msg.sender.transfer(ethers);
        }
    }

  /**
   * @dev Allow the owner to withdraw tokens from the contract without taking tokens from deposits.
   * @param tokens quantity of tokens to be withdrawn
   */
    function withdrawTalao(uint256 tokens)
        public
        onlyOwner
    {
        require(balanceOf(this).sub(totalDeposit) >= tokens);
        _transfer(this, msg.sender, tokens);
    }

  /******************************************/
  /*      vault functions start here        */
  /******************************************/

  /**
  * @dev Allows anyone to create a vault access.
  *      Vault is setup in another contract
  *      Vault deposit is transferred to token contract and sum is stored in totalDeposit
  *      Price must be lower than Vault deposit
  * @param price to pay to access certificate vault
  */
    function createVaultAccess (uint256 price)
    public
    onlyMintingFinished
    {
        require(AccessAllowance[msg.sender][msg.sender].clientAgreement==false);
        if (price>vaultDeposit) {
            Vault(msg.sender, msg.sender, 2);
            return;
        }
        if (balanceOf(msg.sender)<vaultDeposit) {
            Vault(msg.sender, msg.sender,3);
            return;
        }
        Data[msg.sender].accessPrice=price;
        super.transfer(this, vaultDeposit);
        totalDeposit = totalDeposit.add(vaultDeposit);
        Data[msg.sender].userDeposit=vaultDeposit;
        Data[msg.sender].sharingPlan=100;
        AccessAllowance[msg.sender][msg.sender].clientAgreement=true;
        Vault(msg.sender, msg.sender, 1);
    }

  /**
  * @dev Closes a vault access, deposit is sent back to freelance wallet
  *      Total deposit in token contract is reduced by user deposit
  */
    function closeVaultAccess()
        public
        onlyMintingFinished
    {
        require(AccessAllowance[msg.sender][msg.sender].clientAgreement==true);
        require(_transfer(this, msg.sender, Data[msg.sender].userDeposit));
        AccessAllowance[msg.sender][msg.sender].clientAgreement=false;
        totalDeposit=totalDeposit.sub(Data[msg.sender].userDeposit);
        Data[msg.sender].sharingPlan=0;
        Vault(msg.sender, msg.sender, 0);
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
        require(_to != 0x0);
        require(balances[_from] >= _value);
        require((balances[_to].add(_value)) > balances[_to]);

        balances[_from] = balances[_from].sub(_value);
        balances[_to] = balances[_to].add(_value);
        Transfer(_from, _to, _value);
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
        require(newplan<=100);
        require(AccessAllowance[msg.sender][msg.sender].clientAgreement==true);
        AccessAllowance[Data[msg.sender].appointedAgent][msg.sender].clientAgreement=false;
        Vault(Data[msg.sender].appointedAgent, msg.sender, 4);
        Data[msg.sender].appointedAgent=newagent;
        Data[msg.sender].sharingPlan=newplan;
        AccessAllowance[newagent][msg.sender].clientAgreement=true;
        Vault(newagent, msg.sender, 5);
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
        require(AccessAllowance[freelance][freelance].clientAgreement==true);
        require(AccessAllowance[msg.sender][freelance].clientAgreement!=true);
        if (balanceOf(msg.sender)<Data[freelance].accessPrice){
            Vault(msg.sender, freelance, 7);
            return false;
        }
        uint256 freelance_share = Data[freelance].accessPrice.mul(Data[freelance].sharingPlan).div(100);
        uint256 agent_share = Data[freelance].accessPrice.sub(freelance_share);
        super.transfer(freelance, freelance_share);
        super.transfer(Data[freelance].appointedAgent, agent_share);
        AccessAllowance[msg.sender][freelance].clientAgreement=true;
        AccessAllowance[msg.sender][freelance].clientDate=block.number;
        Vault(msg.sender, freelance, 6);
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
        return Data[freelance].appointedAgent;
    }

  /**
  * @dev Fallback function ; only owner can send ether for marketplace purposes.
  **/
    function ()
        public
        payable
        onlyOwner
    {

    }

}