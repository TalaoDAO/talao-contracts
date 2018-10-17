pragma solidity ^0.4.25;

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
    function importDoc(uint _newId, uint _newIndex, uint _id)
        public
    {
        (bytes32 title, string memory description, uint start, uint end, uint duration, bytes32[] memory keywords, uint[] memory ratings, bytes32 ipfs) = previousVault.getDoc(_id);
        uint _doctype = previousVault.getDocType(_id);
        Vault.Document storage doc = importedDocuments[_newId];
        doc.title = title;
        doc.description = description;
        doc.start = start;
        doc.end = end;
        doc.duration = duration;
        doc.keywords = keywords;
        doc.ratings = ratings;
        doc.doctype = _doctype;
        doc.ipfs = ipfs;
        doc.published = true;
        doc.index = _newIndex;
    }

    /**
     * @dev Get an imported document
     */
    function getImportedDoc(uint _id)
        view
        public
        returns (
            bytes32 title,
            string description,
            uint start,
            uint end,
            uint duration,
            bytes32[] keywords,
            uint[] ratings,
            uint doctype,
            bytes32 ipfs
        )
    {
        Vault.Document storage doc = importedDocuments[_id];
        return (
            doc.title,
            doc.description,
            doc.start,
            doc.end,
            doc.duration,
            doc.keywords,
            doc.ratings,
            doc.doctype,
            doc.ipfs
        );
    }
}
