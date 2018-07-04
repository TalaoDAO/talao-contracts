var MiniVaultContract = artifacts.require("./MiniVault");

module.exports = function (deployer) {
  deployer.deploy(MiniVaultContract);
};