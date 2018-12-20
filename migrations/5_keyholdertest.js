const Foundation = artifacts.require('./Foundation.sol');
const KeyHolderLibrary = artifacts.require("./identity/KeyHolderLibrary.sol");
const KeyHolderTest = artifacts.require("./test/KeyHolderTest.sol");

module.exports = function(deployer) {
   deployer.deploy(KeyHolderLibrary);
   deployer.link(KeyHolderLibrary, KeyHolderTest);
   deployer.deploy(KeyHolderTest);
};
