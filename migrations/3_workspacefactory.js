const Foundation = artifacts.require('./Foundation.sol');
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const WorkspaceFactory = artifacts.require('./WorkspaceFactory.sol');

// Rinkeby
// const token = '0xcbc408e1962001f489d296b5a05a16db87fb86e3'

// Ropsten
// const token = '0x76504f37a203e98e62cb453c51d0167318c5c2be'

// Mainnet
const token = '0x1d4ccc31dab6ea20f461d329a0562c1c58412515'

module.exports = function(deployer) {
   deployer.deploy(Foundation, {overwrite: false});
   deployer.deploy(KeyHolderLibrary);
   deployer.link(KeyHolderLibrary, [ClaimHolderLibrary, WorkspaceFactory]);
   deployer.deploy(ClaimHolderLibrary);
   deployer.link(ClaimHolderLibrary, WorkspaceFactory);
   deployer.deploy(WorkspaceFactory, Foundation.address, token);
};
