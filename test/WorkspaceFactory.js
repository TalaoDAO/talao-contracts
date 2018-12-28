const truffleAssert = require('truffle-assertions');
const truffleCost = require('truffle-cost');

const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const WorkspaceFactory = artifacts.require('WorkspaceFactory');
const Workspace = artifacts.require('Workspace');

// "this string just fills a bytes32"
let name1, name2, tagline, url, publicEmail, privateEmail, fileHash;
name1 = name2 = tagline = url = publicEmail = privateEmail = fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const mobile = '0x74686973206973203136206279746573';
// String.
const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;

contract('Workspace Factory', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const someone = accounts[9];
  let token;
  let foundation;
  let workspaceFactory;
  let workspace1address, workspace2address;
  let workspace1, workspace2;

  it('Should deploy keyHolderLibrary, link it in ClaimHolderLibrary, deploy claimHolderLibrary, link both libs in WorkspaceFactory and Workspace', async() => {
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await WorkspaceFactory.link(KeyHolderLibrary, keyHolderLibrary.address);
    await WorkspaceFactory.link(ClaimHolderLibrary, claimHolderLibrary.address);
    await Workspace.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Workspace.link(ClaimHolderLibrary, claimHolderLibrary.address);
  });

  // Simple init, already fully tested before the ICO.
  it('Should init token with Vault deposit of 100 TALAO and transfer 1000 TALAO to User1, User2 and User3. User1 should create a Vault access with a price of 10 TALAO and User2 should create a free Vault access', async() => {
    token = await TalaoToken.new();
    await token.mint(talaoOwner, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
  });

  it('Should deploy Foundation contract', async() => {
    foundation = await Foundation.new(token.address);
    assert(foundation);
  });

  it('Should deploy WorkspaceFactory contract', async() => {
    workspaceFactory = await WorkspaceFactory.new(foundation.address, token.address);
    assert(workspaceFactory);
  });

  it('Should add WorkspaceFactory to Foundation', async() => {
    const result = await foundation.addFactory(workspaceFactory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('WorkspaceFactory should be registered in Foundation', async() => {
    const result = await foundation.factories(workspaceFactory.address);
    assert(result);
  });

  it('Through the factory, User1 should create Workspace1 final contract of category1 (Freelancer).', async() => {
    const result = await truffleCost.log(
      workspaceFactory.createWorkspace(
        1001,
        0,
        0,
        '0x',
        '0x',
        {from: user1}
      ),
      'EUR'
    );
    assert(result);
  });

  it('Since no events were emitted, we ask to the Foundation registry the contract address', async() => {
    workspace1address = await foundation.ownersToContracts(user1, {from: someone});
  });

  it('Should load final contract WorkspaceFactory', async() => {
    workspace1 = await Workspace.at(workspace1address);
    assert(workspace1);
  });

  it('Workspace 1 should have Factory as creator', async() =>  {
    const result = await workspace1.identityInformation();
    assert.equal(result[0], workspaceFactory.address);
  });

  it('User1 should have ERC 725 key with purpose 1 (Manager)', async() => {
    const result = workspace1.hasIdentityPurpose(1, {from: user1});
    assert(result);
  });

  it('workspaceFactory and Someone should not have ERC 725 key with purpose 1 (Manager)', async() => {
    const result1 = await workspace1.hasIdentityPurpose(1, {from: workspaceFactory.address});
    assert(!result1);
    const result2 = await workspace1.hasIdentityPurpose(1, {from: someone});
    assert(!result2);
  });

});
