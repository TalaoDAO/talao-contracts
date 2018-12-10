pragma solidity ^0.4.24;

import './Partner.sol';
import './TalaoToken.sol';

/**
 * @title Interface with Ownable.sol
 */
interface OwnerInterface {
    function owner() external view returns (address);
}

/**
 * @title Permissions contract.
 * @author Talao, Polynomial, Slowsense, Blockchain Partner.
 */
contract Permissions is Partner {

    TalaoToken token;

    /**
     * @dev Constructor.
     */
    constructor(uint8 _category, address _token) public Partner(_category) {
        partnerInformation.category = _category;
        token = TalaoToken(_token);
    }

    /**
     * @dev This modifier is meant to be used in inherited contracts,
     * @dev in most read functions.
     * @dev See functions below.
     */
    modifier onlyReader() {

        // Get Vault access price in the Talao token.
        (uint accessPrice,,,) = token.data(owner());

        OwnerInterface partnerContract = OwnerInterface(msg.sender);

        // OR conditions for Talao reader:
        // 1) Sender is this contract owner.
        // 2) Sender has vaultAccess to this contract owner in the token.
        // 3) Sender is a contract owned by someone who has vaultAccess to this contract in the token.
        // 4) Sender is a Partner contract and owner has an open Vault in the token.
        // 3) Vault is free and owner has an open Vault in the token.
        require(
            (
                isOwner() ||
                token.hasVaultAccess(owner(), msg.sender) ||
                token.hasVaultAccess(owner(), partnerContract.owner()) ||
                (
                    isPartner() &&
                    token.hasVaultAccess(owner(), owner())
                ) ||
                (
                    accessPrice == 0 &&
                    token.hasVaultAccess(owner(), owner())
                )
            ),
            'Vault access denied.'
        );
        _;
    }
}
