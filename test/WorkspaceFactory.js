const web3 = require('web3');
const truffleAssert = require('truffle-assertions');
const truffleCost = require('truffle-cost');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const WorkspaceFactory = artifacts.require('WorkspaceFactory');
const Workspace = artifacts.require('Workspace');

// Contract instances / addresses.
let token, foundation, workspaceFactory, workspace;
let workspaceAddress;

contract('Workspace Factory', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
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
    // 3. Deploy Foundation.
    foundation = await Foundation.new();
  });

  it('Should deploy WorkspaceFactory contract and add it to Foundation', async() => {
    workspaceFactory = await WorkspaceFactory.new(foundation.address, token.address);
    assert(workspaceFactory);
    await foundation.addFactory(workspaceFactory.address);
  });

  it('Through the factory, User1 should create Workspace1 final contract of category1 (Freelancer).', async() => {
    const result = await truffleCost.log(
      workspaceFactory.createWorkspace(
        1001,
        1,
        1,
        '0x11',
        '0x12',
        {from: user1}
      )
    );
    assert(result);
  });

  it('Should load final contract WorkspaceFactory', async() => {
    workspaceaddress = await foundation.ownersToContracts(user1, {from: someone});
    workspace = await Workspace.at(workspaceaddress);
    assert(workspace);
  });

  it('Workspace 1 should have Factory as creator', async() =>  {
    const result = await workspace.identityInformation();
    assert.equal(result[0], workspaceFactory.address);
  });

  it('User1 should have ERC 725 key with purpose 1 (Manager)', async() => {
    const result = workspace.hasIdentityPurpose(1, {from: user1});
    assert(result);
  });

  it('workspaceFactory or anyone should not have ERC 725 key with purpose 1 (Manager)', async() => {
    const result1 = await workspace.hasIdentityPurpose(1, {from: workspaceFactory.address});
    assert(!result1);
    const result2 = await workspace.hasIdentityPurpose(1, {from: someone});
    assert(!result2);
  });

  it('Should not be possible to create another Workspace for the same user', async() => {
    result = truffleAssert.fails(
      workspaceFactory.createWorkspace(
        1001,
        1,
        1,
        '0x11',
        '0x12',
        {from: user1}
      )
    );
    assert(result);
  });

  it('Should not be possible to create a Workspace with unauthorized category', async() => {
    result = truffleAssert.fails(
      workspaceFactory.createWorkspace(
        12345689,
        1,
        1,
        '0x11',
        '0x12',
        {from: user2}
      )
    );
    assert(result);
  });

});
