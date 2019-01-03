pragma solidity ^0.4.24;

import "../ownership/Ownable.sol";
import "../Workspace.sol";

/**
 * @title Service test implementation.
 * @notice Services are brokers of tokens so we follow "code is law".
 * Even if they are ownable, owner has only one privilege: change the price.
 * @author Talao, Polynomial.
 */
contract Service1 is Ownable {

    // Talao token contract.
    TalaoToken public token;

    // Seller of this service (contract).
    address public seller;

    // Service price.
    uint price;

    // Authorization status.
    enum PartnershipAuthorization { Unknown, Authorized, Pending, Rejected, Removed }

    constructor(address _token, address _seller, uint _price) public {
        token = TalaoToken(_token);
        seller = _seller;
        price = _price;
    }

    /**
     * @dev Act on token's ping.
     * 1) msg.sender buys this service in the token with:
     * token.approveAndCall(address _spender, uint256 _value, bytes _extraData)
     * with _spender = address of this service contract
     * 2) token pings this contract on receiveApproval as such:
     */
    function receiveApproval(
        address _from,
        uint256 _value,
        address _token,
        bytes _extraData
    )
        external
    {
        require(msg.sender == address(token), 'Only Talao token');
        require(_token == address(token), 'Only Talao token');
        require(_value == price, 'Bad price');
        // Try to run the service.
        // If success, transfer tokens to service owner.
        if (runService(_from, _extraData)) {
            token.transferFrom(_from, owner(), price);
        }
        // Otherwise get auhorized tokens and refund buyer.
        // Getting them and refunding will cancel the allowance.
        else {
            token.transferFrom(_from, this, price);
            token.transferFrom(this, _from, price);
        }
    }

    /**
     * @dev Run the service.
     * _extraData will differ for different services.
     * Example here: send a text to all freelance partners of a contract.
     */
    function runService(address _from, bytes _extraData)
        internal
        returns (bool)
    {
        // If service is not ready we cancel.
        if (!isServiceReady()) {
            return false;
        } else {
            // Init temporary variables.
            uint hisCategory;
            uint hisAuthorization;
            // Get the seller's partnerships indexes.
            PartnershipInterface sellerPartnership = PartnershipInterface(seller);
            address[] memory recipients = sellerPartnership.getKnownPartnershipsContracts();
            for (uint i = 0; i < recipients.length; i++) {
                // Get partnership info.
                (
                    ,
                    hisCategory,
                    hisAuthorization,
                    ,
                ) = sellerPartnership.getPartnership(recipients[i]);
                // If active Freelancer
                if (
                    hisCategory == 1001 &&
                    hisAuthorization == uint(PartnershipAuthorization.Authorized)
                ) {
                    // Send message.
                    IdentityInterface sellerIdentity = IdentityInterface(seller);
                    sellerIdentity.identityboxSendtext(100000, _extraData);
                }
            }
            // _from is not used here but I wanted to keep it as a parameter,
            // since it's an example.
            // Let's just get rid of the compiler warning here.
            // Remove parameter if not used, on production service contracts.
            require(_from == _from);
            return true;
        }
    }

    /**
     * @dev Buyer should call this to check if service is operational,
     * before he allows tokens expense.
     * Check will differ for different services.
     * Example here: send a text to all partners of a contract.
     */
    function isServiceReady() public view returns (bool) {
        // Here we want the seller to have added an ERC 725 key 20003
        // for this contract for this contract to read the partners index.
        ERC725 sellerCheck = ERC725(seller);
        return sellerCheck.keyHasPurpose(keccak256(abi.encodePacked(address(this))), 20003);
    }

    /**
     * @dev Change service price.
     */
    function setPrice(uint _price) external onlyOwner {
        price = _price;
    }
}
