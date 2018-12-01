const TalaoTokenContract = artifacts.require('./TalaoToken');
const VaultFactoryContract = artifacts.require('./VaultFactory');

module.exports = function (deployer) {
  deployer.deploy(TalaoTokenContract).then(function () {
    return deployer.deploy(VaultFactoryContract, TalaoTokenContract.address);
  });
};
