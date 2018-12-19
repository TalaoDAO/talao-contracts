pragma solidity ^0.4.24;

import "./Partnership.sol";
import "../token/TalaoToken.sol";

/**
 * @title Tokenized contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Tokenized is Partnership {

    // Foundation contract.
    Foundation foundation;

    // Talao token contract.
    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, uint _partnerCategory, address _token)
        public Partnership(_foundation, _partnerCategory)
    {
        foundation = Foundation(_foundation);
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }

    /**
     * @dev Read authorization for inherited contracts "private" data.
     */
    function isReader() public view returns (bool) {
        // Get Vault access price in the token for this contract owner,
        // in the Foundation sense.
        (uint accessPrice,,,) = token.data(ownerInFoundation());
        // OR conditions for Reader:
        // 1) Same code for:
        // 1.1) Sender is this contract owner and has an open Vault in the token.
        // 1.2) Sender has vaultAccess to this contract owner in the token.
        // 2) Sender is a member of an authorized Partner contract and owner
        // has an open Vault in the token.
        // 3) Owner has a free vaultAccess in the token and
        // has an open Vault in the token.
        return(
            token.hasVaultAccess(ownerInFoundation(), msg.sender) ||
            (
                isPartnershipMember() &&
                token.hasVaultAccess(ownerInFoundation(), ownerInFoundation())
            ) ||
            (
                accessPrice == 0 &&
                token.hasVaultAccess(ownerInFoundation(), ownerInFoundation())
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

    /**
     * @dev Owner functions require open Vault in token.
     */
    function isOwnerInFoundationWithOpenVault() public view returns (bool) {
        return isOwnerInFoundation() && token.hasVaultAccess(msg.sender, msg.sender);
    }

    /**
     * @dev Modifier version of isWriter.
     */
     modifier onlyOwnerInFoundationWithOpenVault() {
         require(isReader(), 'Access denied');
         _;
     }

     // TODO: modifier for Managers ERC 725
}
