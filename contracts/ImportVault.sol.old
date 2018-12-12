pragma solidity ^0.4.24;

import './Talao.sol';
import './Vault.sol';

/**
 * @title ImportVault.
 * @dev Import a Vault.
 * @author Talao, Blockchain Partners, SlowSense.
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
            bytes32 fileHash,
            uint16 fileEngine,
            uint8 docType,
            uint8 docTypeVersion,
            bool encrypted,
            bytes24 additionalData
        ) = previousVault.getDocument(_id);

        // Storage pointer.
        Vault.Document storage doc = importedDocuments[_newId];

        // Write data.
        doc.fileHash = fileHash;
        doc.fileEngine = fileEngine;
        doc.index = _newIndex;
        doc.docType = docType;
        doc.docTypeVersion = docTypeVersion;
        doc.published = true;
        doc.encrypted = encrypted;
        doc.additionalData = additionalData;
    }

    /**
     * @dev Get an imported document
     */
    function getImportedDocument(uint _id)
        view
        public
        returns (
            bytes32 fileHash,
            uint16 fileEngine,
            uint8 docType,
            uint8 docTypeVersion,
            bool encrypted,
            bytes24 additionalData
        )
    {
        // Memory pointer.
        Vault.Document memory doc = importedDocuments[_id];

        // Return data.
        fileHash = doc.fileHash;
        fileEngine = doc.fileEngine;
        docType = doc.docType;
        docTypeVersion = doc.docTypeVersion;
        encrypted = doc.encrypted;
        additionalData = doc.additionalData;
    }
}
