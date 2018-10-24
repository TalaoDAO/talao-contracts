const TalaoTokenContract = artifacts.require('./TalaoToken');
const FreelancerContract = artifacts.require('./Freelancer');
const VaultFactoryContract = artifacts.require('./VaultFactory');

module.exports = function (deployer) {
  deployer.deploy(TalaoTokenContract).then(function () {
    return deployer.deploy(FreelancerContract, TalaoTokenContract.address).then(function () {
      return deployer.deploy(VaultFactoryContract, TalaoTokenContract.address, FreelancerContract.address);
    });
  });
};
