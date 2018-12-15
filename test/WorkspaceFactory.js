const truffleAssert = require('truffle-assertions');
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
  let result, result1, result2, result3, result4;
  let tx, tx1, tx2, tx3, tx4;

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
    result = await foundation.addFactory(workspaceFactory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('WorkspaceFactory should be registered in Foundation', async() => {
    result = await foundation.factories(workspaceFactory.address);
    assert(result);
  });

  it('Through the factory, User1 should create Workspace1 final contract of category1 (Freelancer).', async() => {
    result = await workspaceFactory.createWorkspace(
      1,
      name1,
      name2,
      tagline,
      url,
      publicEmail,
      fileHash,
      fileEngine,
      description,
      privateEmail,
      mobile,
      {from: user1}
    );
    assert(result);
  });

  it('Since no events were emitted, we ask to the Foundation registry the contract address', async() => {
    workspace1address = await foundation.accountsToContracts(user1, {from: someone});
  });

  it('Should load final contract Workspace1', async() => {
    workspace1 = await Workspace.at(workspace1address);
    assert(workspace1);
  });

  it('In Workspace1, anyone should get public profile', async() => {
    result = await workspace1.publicProfile({from: someone});
    assert.equal(
      result.toString(),
      [
        name1,
        name2,
        tagline,
        url,
        publicEmail,
        fileHash,
        fileEngine,
        description,
      ]
    );
  });

});