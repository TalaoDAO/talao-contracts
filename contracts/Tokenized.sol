pragma solidity ^0.4.24;

import './Partner.sol';
import './TalaoToken.sol';

/**
 * @title Tokenized contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Tokenized is Partner {

    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(uint8 _partnerCategory, address _token) public Partner(_partnerCategory) {
        partnerCategory = _partnerCategory;
        token = TalaoToken(_token);
    }

    /**
     * @dev Read authorization for inherited contracts "private" data.
     */
    function isReader() public view returns (bool) {
        // Get Vault access price in the token.
        (uint accessPrice,,,) = token.data(owner());

        // OR conditions for Reader:
        // 1) Sender is this contract owner.
        // 2) Sender has vaultAccess to this contract owner in the token.
        // 3) Sender is the owner of an authorized Partner contract and
        // has an open Vault in the token.
        // 4) The owner has a free vaultAccess in the token and
        // has an open Vault in the token.
        return(
            isOwner() ||
            token.hasVaultAccess(owner(), msg.sender) ||
            (
                isAuthorizedPartnerOwner() &&
                token.hasVaultAccess(owner(), owner())
            ) ||
            (
                accessPrice == 0 &&
                token.hasVaultAccess(owner(), owner())
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
