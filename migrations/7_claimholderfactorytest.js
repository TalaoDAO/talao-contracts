const Foundation = artifacts.require('./Foundation.sol');
const KeyHolderLibrary = artifacts.require("./identity/KeyHolderLibrary.sol");
const ClaimHolderLibrary = artifacts.require("./identity/ClaimHolderLibrary.sol");
const ClaimHolderFactoryTest = artifacts.require("./test/ClaimHolderFactoryTest.sol");

module.exports = function(deployer) {
   deployer.deploy(KeyHolderLibrary);
   deployer.link(KeyHolderLibrary, [ClaimHolderLibrary, ClaimHolderFactoryTest]);
   deployer.deploy(ClaimHolderLibrary);
   deployer.link(ClaimHolderLibrary, ClaimHolderFactoryTest);
   deployer.deploy(ClaimHolderFactoryTest);
};
