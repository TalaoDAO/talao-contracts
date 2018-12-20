const Foundation = artifacts.require('./Foundation.sol');
const TalaoToken = artifacts.require('./token/TalaoToken.sol');
const KeyHolderLibrary = artifacts.require("./identity/KeyHolderLibrary.sol");
const ClaimHolderLibrary = artifacts.require("./identity/ClaimHolderLibrary.sol");
const WorkspaceFactory = artifacts.require('./WorkspaceFactory.sol');

module.exports = function(deployer) {
   deployer.deploy(Foundation, {overwrite: false});
   deployer.deploy(TalaoToken, {overwrite: false});
   deployer.deploy(KeyHolderLibrary);
   deployer.link(KeyHolderLibrary, [ClaimHolderLibrary, WorkspaceFactory]);
   deployer.deploy(ClaimHolderLibrary);
   deployer.link(ClaimHolderLibrary, WorkspaceFactory);
   deployer.deploy(WorkspaceFactory, Foundation.address, TalaoToken.address);
};
