var TalaoToken = artifacts.require("./token/TalaoToken.sol");

module.exports = function(deployer) {
  deployer.deploy(TalaoToken);
};
