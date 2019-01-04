pragma solidity ^0.4.24;

import "./ERC725.sol";
import "./KeyHolderLibrary.sol";

/**
 * @title Manages an ERC 725 identity keys.
 * @notice Fork of Origin Protocol's implementation at
 * https://github.com/OriginProtocol/origin/blob/master/origin-contracts/contracts/identity/KeyHolder.sol
 * We defined our own set of "sub-ACTION" keys:
 * - 20001 = read private profile & documents (grants isReader()).
 *  Usefull for contracts, for instance to add import contracts.
 * - 20002 = write "Private profile" & Documents
 * - 20003 = read Partnerships
 * - 20004 = use Filebox
 * - 20005 = buy Services
 * Moreover we can add purpose to already existing key.
 */
contract KeyHolder is ERC725 {
    KeyHolderLibrary.KeyHolderData keyHolderData;

    constructor() public {
        KeyHolderLibrary.init(keyHolderData);
    }

    function getKey(bytes32 _key)
        public
        view
        returns(uint256[] purposes, uint256 keyType, bytes32 key)
    {
        return KeyHolderLibrary.getKey(keyHolderData, _key);
    }

    function getKeyPurposes(bytes32 _key)
        public
        view
        returns(uint256[] purposes)
    {
        return KeyHolderLibrary.getKeyPurposes(keyHolderData, _key);
    }

    function getKeysByPurpose(uint256 _purpose)
        public
        view
        returns(bytes32[] _keys)
    {
        return KeyHolderLibrary.getKeysByPurpose(keyHolderData, _purpose);
    }

    function addKey(bytes32 _key, uint256 _purpose, uint256 _type)
        public
        returns (bool success)
    {
        return KeyHolderLibrary.addKey(keyHolderData, _key, _purpose, _type);
    }

    function addPurpose(bytes32 _key, uint256 _purpose)
        public
        returns (bool)
    {
        return KeyHolderLibrary.addPurpose(keyHolderData, _key, _purpose);
    }

    function approve(uint256 _id, bool _approve)
        public
        returns (bool success)
    {
        return KeyHolderLibrary.approve(keyHolderData, _id, _approve);
    }

    function execute(address _to, uint256 _value, bytes _data)
        public
        returns (uint256 executionId)
    {
        return KeyHolderLibrary.execute(keyHolderData, _to, _value, _data);
    }

    function removeKey(bytes32 _key, uint256 _purpose)
        public
        returns (bool success)
    {
        return KeyHolderLibrary.removeKey(keyHolderData, _key, _purpose);
    }

    function keyHasPurpose(bytes32 _key, uint256 _purpose)
        public
        view
        returns(bool exists)
    {
        return KeyHolderLibrary.keyHasPurpose(keyHolderData, _key, _purpose);
    }

}
