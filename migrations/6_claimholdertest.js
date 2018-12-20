const Foundation = artifacts.require('./Foundation.sol');
const KeyHolderLibrary = artifacts.require("./identity/KeyHolderLibrary.sol");
const ClaimHolderLibrary = artifacts.require("./identity/ClaimHolderLibrary.sol");
const ClaimHolderTest = artifacts.require("./test/ClaimHolderTest.sol");

module.exports = function(deployer) {
   deployer.deploy(KeyHolderLibrary);
   deployer.link(KeyHolderLibrary, [ClaimHolderLibrary, ClaimHolderTest]);
   deployer.deploy(ClaimHolderLibrary);
   deployer.link(ClaimHolderLibrary, ClaimHolderTest);
   deployer.deploy(ClaimHolderTest);
};
