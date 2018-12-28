const truffleAssert = require('truffle-assertions');

const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Workspace = artifacts.require('Workspace');

// "this string just fills a bytes32"
let name1, name2, tagline, url, publicEmail, privateEmail, fileHash;
name1 = name2 = tagline = url = publicEmail = privateEmail = fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const mobile = '0x74686973206973203136206279746573';
// String.
const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;

contract('Workspace', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const factory = accounts[8];
  const someone = accounts[9];
  let token;
  let foundation;
  let workspace1, workspace2;

  it('Should deploy keyHolderLibrary, link it in ClaimHolderLibrary, deploy claimHolderLibrary, link both libs in Profile', async() => {
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
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

  // Already tested in Foundation.js.
  it('Should deploy Foundation contract and register a Factory contract', async() => {
    foundation = await Foundation.new();
    // It's only a simulation of a factory contract, otherwise I would have to create one just for this test.
    await foundation.addFactory(factory);
  });

  // Simple init for initial owners, already tested in OwnableInFoundation.js
  it('Factory should deploy Workspace1 (category 1001 = Freelancer) and Workspace2 (category 2001 = Marketplace) and set initial owners to User1 and User2', async() => {
    workspace1 = await Workspace.new(
      foundation.address,
      token.address,
      1001,
      0,
      0,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(workspace1);
    await foundation.setInitialOwnerInFoundation(workspace1.address, user1, {from: factory});
    workspace2 = await Workspace.new(
      foundation.address,
      token.address,
      2001,
      0,
      0,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(workspace2);
    await foundation.setInitialOwnerInFoundation(workspace2.address, user2, {from: factory});
  });

  it('Workspace 1 should have Factory as creator', async() =>  {
    const result = await workspace1.identityInformation();
    assert.equal(result[0], factory);
  });

});
