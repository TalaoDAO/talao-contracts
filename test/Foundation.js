const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const WorkspaceFactory = artifacts.require('WorkspaceFactory');
const Workspace = artifacts.require('Workspace');

// Contract instances & addresses.
let token, foundation, factory, finalContract;
let finalContractAddress;

contract('Foundation', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await WorkspaceFactory.link(KeyHolderLibrary, keyHolderLibrary.address);
    await WorkspaceFactory.link(ClaimHolderLibrary, claimHolderLibrary.address);
    await Workspace.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Workspace.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // 2. Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(defaultUser, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    await token.createVaultAccess(50, { from: user3 });
  });

  it('Should deploy Foundation contract and a Factory contract', async() => {
    foundation = await Foundation.new(token.address);
    assert(foundation);
    factory = await WorkspaceFactory.new(foundation.address, token.address);
  });

  it('Should add the factory to Foundation', async() => {
    const result = await foundation.addFactory(factory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('Through the factory, User1 should create a final contract of category 1001 (Freelancer)', async() => {
    const result = await factory.createWorkspace(
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: user1}
    );
    assert(result);
  });

  it('No events were emitted, but we can now ask the contract address to the Foundation ownersToContracts the contract address. It should be consistent with contractToOwners', async() => {
    finalContractAddress = await foundation.ownersToContracts(user1, {from: someone});
    const result = await foundation.contractsToOwners(finalContractAddress, {from: someone});
    assert.equal(result.toString(), user1)
  });

  it('Should load final contract', async() => {
    finalContract = await Workspace.at(finalContractAddress);
    assert(finalContract);
  });

  it('contractsIndex should contain 1 contract addresses and be only accessible by Foundation owner', async() => {
    const result = await foundation.getContractsIndex({from: defaultUser});
    assert.equal(result.toString(), [
      finalContract.address
    ]);
    truffleAssert.fails(foundation.getContractsIndex({from: someone}));
  });

  it('User1 should transfer his contract to User2', async() => {
    await foundation.transferOwnershipInFoundation(finalContract.address, user2, { from: user1 });
    const result = await foundation.contractsToOwners(finalContract.address, {from: someone});
    assert.equal(result, user2);
  });

  it('User2 should renounce to ownership of his contract in the Foundation', async() => {
    const result = await foundation.renounceOwnershipInFoundation(finalContract.address, {from: user2});
    assert(result);
  });

  it('Talao owner should remove the Factory in the Foundation', async() => {
    const result = await foundation.removeFactory(factory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryRemoved');
  });

});
