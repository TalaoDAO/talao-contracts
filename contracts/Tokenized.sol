pragma solidity ^0.4.24;

import './Partnership.sol';
import './TalaoToken.sol';

/**
 * @title Tokenized contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Tokenized is Partnership {

    // Interface with Foundation.
    FoundationInterface foundation;

    // TODO: interface instead.
    TalaoToken public token;

    /**
     * @dev Constructor.
     */
    constructor(address _foundation, uint8 _partnerCategory, address _token)
        public Partnership(_foundation, _partnerCategory)
    {
        foundation = FoundationInterface(_foundation);
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
        // 1) Sender is this contract owner.
        // 2) Sender has vaultAccess to this contract owner in the token.
        // 3) Sender is the owner of an authorized Partner contract and
        // has an open Vault in the token.
        // 4) The owner has a free vaultAccess in the token and
        // has an open Vault in the token.
        return(
            isOwnerInFoundation() ||
            token.hasVaultAccess(ownerInFoundation(), msg.sender) ||
            (
                isAuthorizedPartnershipOwner() &&
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
}
