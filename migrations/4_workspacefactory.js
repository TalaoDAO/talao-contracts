const WorkspaceFactory = artifacts.require('./WorkspaceFactory.sol');
const Foundation = artifacts.require('./Foundation.sol');
const TalaoToken = artifacts.require('./token/TalaoToken.sol');

module.exports = function(deployer) {
   deployer.deploy(Foundation, {overwrite: false});
   deployer.deploy(TalaoToken, {overwrite: false});
   deployer.deploy(WorkspaceFactory, Foundation.address, TalaoToken.address);
};
