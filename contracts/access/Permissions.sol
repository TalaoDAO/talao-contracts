pragma solidity ^0.4.24;

import "./Partnership.sol";

/**
 * @title Permissions contract.
 * @author Talao, Polynomial.
 */
contract Permissions is Partnership {

    // Foundation contract.
    Foundation foundation;

    // Talao token contract.
    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, address _token, uint _partnerCategory)
        public Partnership(_foundation, _token, _partnerCategory)
    {
        foundation = Foundation(_foundation);
        token = TalaoToken(_token);
        partnerCategory = _partnerCategory;
    }

    /**
     * @dev Is msg.sender a "member" of this contract, in the Foundation sense?
     */
    function isMember() public view returns (bool) {
        return foundation.membersToContracts(msg.sender) == address(this);
    }

    /**
     * @dev Read authorization for inherited contracts "private" data.
     */
    function isReader() public view returns (bool) {
        // Get Vault access price in the token for this contract owner,
        // in the Foundation sense.
        (uint accessPrice,,,) = token.data(ownerInFoundation());
        // OR conditions for Reader:
        // 1) Same code for
        // 1.1) Sender is this contract owner and has an open Vault in the token.
        // 1.2) Sender has vaultAccess to this contract owner in the token.
        // 2) Owner has open Vault in the token and:
        // 2.1) Sender is a member of this contract,
        // 2.2) Sender is a member of an authorized Partner contract
        // 2.3) Owner has a free vaultAccess in the token
        return(
            token.hasVaultAccess(ownerInFoundation(), msg.sender) ||
            (
                token.hasVaultAccess(ownerInFoundation(), ownerInFoundation()) &&
                (
                    isMember() ||
                    isPartnershipMember() ||
                    accessPrice == 0
                )
            )
        );
    }

    /**
     * @dev Modifier version of isReader.
     */
    modifier onlyReader() {
        require(isReader(), 'Access denied');
        _;
    }
}
