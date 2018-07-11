//var OwnableContract = artifacts.require("Ownable");
var TalaoTokenContract = artifacts.require("./TalaoToken");
var FreelancerContract = artifacts.require("./Freelancer");
var VaultFactoryContract = artifacts.require("./VaultFactory");
//var VaultContract = artifacts.require("Vault");
//var SafeMathLib = artifacts.require("SafeMath");

module.exports = function (deployer) {
  // deployment steps
  //deployer.deploy(SafeMathLib);
  //deployer.deploy(OwnableContract);
  deployer.deploy(TalaoTokenContract).then(function () {
    return deployer.deploy(FreelancerContract, TalaoTokenContract.address).then(function () {
      return deployer.deploy(VaultFactoryContract, TalaoTokenContract.address, FreelancerContract.address);
    });
  });
};