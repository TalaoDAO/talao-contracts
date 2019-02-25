const Foundation = artifacts.require('./Foundation.sol');
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const Workspace = artifacts.require('./Workspace.sol');

module.exports = function(deployer) {
   deployer.deploy(Foundation, {overwrite: false});
   deployer.deploy(KeyHolderLibrary, {overwrite: false});
   deployer.link(KeyHolderLibrary, Workspace);
   deployer.deploy(ClaimHolderLibrary, {overwrite: false});
   deployer.link(ClaimHolderLibrary, Workspace);
   deployer.deploy(
     Workspace,
     Foundation.address,
     '0x1d4ccc31dab6ea20f461d329a0562c1c58412515',
     1001,
     1,
     1,
     '0x2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d494942496a414e42676b71686b6947397730424151454641414f43415138414d49494243674b43415145416930384332666d636e426a6f784a38517452706f0a5a466f2f523731683961554759782b434d6b654c5a4f624d624736504b66733043386b462b6143774a74574965394a503336514a4570766d4b727956552f45620a7130666c7033382b76475831484e434156593068613964452f67503462484f66693357632b6561763466326c552f6677686a4a303370474e5853763537454e630a675770536b4269665668337a626171503233564930344d6b5354646473753778396864365175474772364453446b7757716276546431616a756e692b46576c540a4546656a39716c44486f7a7651627350375833706a6d7769784b4e574136746f49575a747141656c4c47654c32736f705565324154536b6f4f633856514455470a344e6e474b30474b684f77466e6d506e7442355a4b666b6e7764697467356b512f594c65544e2f696e7676736a68536c4674374872747a346934794b787a584d0a74514944415141420a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d',
     '0x1391e73706d72650dc956914f0a9e299aa014859b6eb8c61a9522619005bdcf15226d93d9986106399d5c0344bdb07d44fe512435e94c63d6658e70088cfb32e3ff7dff7b0136a230e9161efcd604e4add05bd36742dbd898c2ccab4b794983ced29becbe469d700cbe42cab9e60215d1c5eb91eabb1e2f29f45a2e69ab8a7b188cc29b4562743e37d824ee0c521241d24fb251ec520d287af6fc2095c2eed7dc7f59bfbce24c8f49ba9afa8e766006db60fcf80d31b9d352a4a3f9db5db3a7e6b4b04bc9d5c6b4e46b39e53602a7e2f4f7dfa823f0b487258db39cf8bc7742c78b6c40f0a53eaa1f26b297a44be74f001936fed1217397a4cba91c36d0c59b4',
     '0x6cd77b451c7340c9735776cb615a00436e8a22b35a320d568ca186198690bbf966c379745a99c4a135ebf70f0b2d0b838c85234f5f6ba9823bed6f1a62003ea17e7b7e88adf28b4ce88b06455675c0ce04be53ead10c86b1ed44241c40f0c3955ccc405dc2475f2e60304944c20c8dc3fd5bb9167dee930885ee6dfdc2992f91ca56a59ec11f90cc1b7a55db4422e2250a625e9fedfc7d8217fbb3c428393c154b361bc211dbde394cafeabff6627ea70ace46b7e9d57e56ca0554d63d0fd01537615c10dd40f3b8ffe5939e4c911ce43941fd110e0442e4237ddec9eed69bd807e89a473246ec760526573ce7e5f086718cd8f92d6f8c086858dbbbacd7cc03'
   );
};
