const Foundation = artifacts.require('./Foundation.sol');
const TalaoToken = artifacts.require('./token/TalaoToken.sol');
const KeyHolderLibrary = artifacts.require("./identity/KeyHolderLibrary.sol");
const ClaimHolderLibrary = artifacts.require("./identity/ClaimHolderLibrary.sol");
const WorkspaceFactory = artifacts.require('./WorkspaceFactory.sol');

module.exports = function(deployer) {
   deployer.deploy(Foundation, {overwrite: false});
   // Comment this to not deploy a new token.
   // deployer.deploy(TalaoToken, {overwrite: false});
   deployer.deploy(KeyHolderLibrary);
   deployer.link(KeyHolderLibrary, [ClaimHolderLibrary, WorkspaceFactory]);
   deployer.deploy(ClaimHolderLibrary);
   deployer.link(ClaimHolderLibrary, WorkspaceFactory);
   // Comment this to not deploy a new token.
   // deployer.deploy(WorkspaceFactory, Foundation.address, TalaoToken.address);
   // Uncomment and fill in token address to not deploy a new token.
   deployer.deploy(WorkspaceFactory, Foundation.address, '0xb8a0a9ee2e780281637bd93c13076cc5e342c9ae');
};
