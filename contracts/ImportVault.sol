pragma solidity ^0.4.24;

import './Talao.sol';
import './Vault.sol';
import './Freelancer.sol';

/**
 * @title ImportVault.
 * @dev Import a Talent's Vault.
 * @author SlowSense, Talao, Blockchain Partners.
 */
contract ImportVault is Ownable {

    Vault public previousVault;

    mapping (uint => Vault.Document) public importedDocuments;

    constructor(address _v) public {
        previousVault = Vault(_v);
    }

    /**
     * @dev Import a document.
     */
    function importDocument(uint _newId, uint16 _newIndex, uint _id)
        public
    {
        // Read document from old Vault.
        (
            uint8 type_doc,
            uint8 type_version,
            uint8 storage_type,
            uint8 misc,
            bytes32 title,
            bytes32 storage_hash,
            bool encrypted
        ) = previousVault.getDocument(_id);

        // Storage pointer.
        Vault.Document storage doc = importedDocuments[_newId];

        // Write data.
        doc.published = true;
        doc.encrypted = encrypted;
        doc.type_doc = type_doc;
        doc.type_version = type_version;
        doc.storage_type = storage_type;
        doc.misc = misc;
        doc.index = _newIndex;
        doc.title = title;
        doc.storage_hash = storage_hash;
    }

    /**
     * @dev Get an imported document
     */
    function getImportedDocument(uint _id)
        view
        public
        returns (
            uint8 type_doc,
            uint8 type_version,
            uint8 storage_type,
            uint8 misc,
            bytes32 title,
            bytes32 storage_hash,
            bool encrypted
        )
    {
        // Memory pointer.
        Vault.Document memory doc = importedDocuments[_id];

        // Return data.
        type_doc = doc.type_doc;
        type_version = doc.type_version;
        storage_type = doc.storage_type;
        misc = doc.misc;
        title = doc.title;
        storage_hash = doc.storage_hash;
        encrypted = doc.encrypted;
    }
}
