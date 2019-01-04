pragma solidity ^0.4.24;

import "../ownership/Ownable.sol";
import "../content/Documents.sol";

/**
 * @title Test to migrate from a WorkspaceV1 to this WorkspaceV2.
 * @author Talao, Polynomial, Blockchain Partners.
 * @notice We use a totally different and basic contract on purpose.
 */
contract WorkspaceV2 is Ownable {

    struct Document {
        uint8 docType;
        address issuer;
        uint16 fileLocationEngine;
        bytes fileLocationHash;
    }

    mapping(bytes32 => Document) internal documents;

    bytes32[] internal documentsIndex;

    function getDocument(bytes32 _checksum)
        public
        view
        returns (
            uint8,
            address,
            uint16,
            bytes
        )
    {
        Document memory doc = documents[_checksum];
        return(
            doc.docType,
            doc.issuer,
            doc.fileLocationEngine,
            doc.fileLocationHash
        );
    }

    function getDocuments() public view returns (bytes32[]) {
        return documentsIndex;
    }

    function importDocuments(address _contract) public onlyOwner {
        DocumentsInterface previous = DocumentsInterface(_contract);
        uint[] memory docIds = previous.getDocuments();
        for (uint i = 0; i < docIds.length; i++) {
            importDocument(_contract, docIds[i]);
        }
    }

    function importDocument(address _contract, uint _id) internal {
        DocumentsInterface previous = DocumentsInterface(_contract);
        (
            ,
            ,
            ,
            bytes32 checksum,
            ,
            ,
        ) = previous.getDocument(_id);
        Document storage doc = documents[checksum];
        (
            doc.docType,
            ,
            doc.issuer,
            ,
            doc.fileLocationEngine,
            doc.fileLocationHash,
        ) = previous.getDocument(_id);
        documentsIndex.push(checksum);
    }
}
