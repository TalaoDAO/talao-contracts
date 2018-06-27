//var OwnableContract = artifacts.require("Ownable");
var TalaoTokenContract = artifacts.require("./TalaoToken");
var VaultfactoryContract = artifacts.require("./VaultFactory");
var FreelancerContract = artifacts.require("./Freelancer");
//var VaultContract = artifacts.require("Vault");
//var SafeMathLib = artifacts.require("SafeMath");

module.exports = function (deployer) {
  // deployment steps
  //deployer.deploy(SafeMathLib);
  //deployer.deploy(OwnableContract);
  deployer.deploy(TalaoTokenContract).then(function () {
    deployer.deploy(FreelancerContract, TalaoTokenContract.address).then(function () {
      deployer.deploy(VaultfactoryContract, TalaoTokenContract.address, FreelancerContract.address);
    });
    return;
  });
};