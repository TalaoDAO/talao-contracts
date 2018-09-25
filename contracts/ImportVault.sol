pragma solidity ^0.4.23;

import "./Talao.sol";
import "./Vault.sol";
import "./Freelancer.sol";

contract ImportVault is Ownable {

    Vault public previousVault;

    mapping(uint=>Vault.certifiedDocument) public importedDocs;

    constructor(address _v) public {
      previousVault = Vault(_v);
    }

    function importDocument(uint newIndex, bytes32 docId) {
      (bytes32 title, string memory description, bytes32[] memory keywords,
      uint[] memory ratings, bool isAlive, uint index, uint documentType, uint startDate,
      uint endDate, uint duration) = previousVault.getFullDocument(docId);
      Vault.certifiedDocument id = importedDocs[newIndex];
      id.title = title;
      id.description = description;
      id.ratings = ratings;
      id.keywords = keywords;
      id.isAlive = isAlive;
      id.index = index;
      id.documentType = documentType;
      id.startDate = startDate;
      id.endDate = endDate;
      id.duration = duration;
    }

    function getFullDocument(uint id)
        view
        public
        returns (bytes32 title, string description, bytes32[] keywords,
          uint[] ratings, bool isAlive, uint index, uint documentType, uint startDate,
          uint endDate, uint duration)
    {
        Vault.certifiedDocument cd = importedDocs[id];
        return (cd.title, cd.description, cd.keywords, cd.ratings, cd.isAlive, cd.index,
                cd.documentType, cd.startDate, cd.endDate, cd.duration);
    }
}