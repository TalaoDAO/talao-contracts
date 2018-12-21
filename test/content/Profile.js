const truffleAssert = require('truffle-assertions');

const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Profile = artifacts.require('ProfileTest');

// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const bytes16 = '0x74686973206973203136206279746573';
// String.
const string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;

contract('Profile', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const factory = accounts[8];
  const someone = accounts[9];
  let token;
  let profile1, profile2;

  it('Should deploy keyHolderLibrary, link it in ClaimHolderLibrary, deploy claimHolderLibrary, link both libs in Profile', async() => {
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Profile.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Profile.link(ClaimHolderLibrary, claimHolderLibrary.address);
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
  it('Factory should deploy Profile1 (category 1) and Profile2 (category 2), set initial owners and give them ERC 725 Management keys', async() => {
    profile1 = await Profile.new(foundation.address, token.address, 1, {from: factory});
    assert(profile1);
    await foundation.setInitialOwnerInFoundation(profile1.address, user1, {from: factory});
    await profile1.addKeyFromAddress(user1, 1, 1, {from: factory});
    profile2 = await Profile.new(foundation.address, token.address, 2, {from: factory});
    assert(profile2);
    await foundation.setInitialOwnerInFoundation(profile2.address, user2, {from: factory});
    await profile2.addKeyFromAddress(user2, 1, 1, {from: factory});
  });

  it('In profile1, User1 should set his public profile', async() => {
    const result = await profile1.setPublicProfile(
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      fileEngine,
      string,
      {from:user1}
    );
    assert(result);
  });

  it('In profile1, anyone should get public profile', async() => {
    const result = await profile1.publicProfile({from: someone});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes32,
        bytes32,
        bytes32,
        bytes32,
        bytes32,
        fileEngine,
        string
      ]
    );
  });

  it('In profile1, user1 should set his private profile', async() => {
    const result = await profile1.setPrivateProfile(
      bytes32,
      bytes16,
      {from: user1}
    );
    assert(result);
  });

  it('In profile1, user1 should get his private profile', async() => {
    const result = await profile1.getPrivateProfile({from:user1});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes16
      ]
    )
  });

  it('In profile1, user2 should not be able to get private profile', async() => {
    const result = await truffleAssert.fails(
      profile1.getPrivateProfile({ from: user2 })
    );
    assert(!result);
  });

  it('user2 requests partnership of his profile2 contract with profile1 contract, user1 accepts, and then user2 should be able to get private profile of profile1', async() => {
    await profile2.requestPartnership(profile1.address, {from:user2});
    await profile1.authorizePartnership(profile2.address, {from:user1});
    const result = await profile1.getPrivateProfile({from:user2});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes16
      ]
    )
  });

  it('In profile1, user3 should not be able to get private profile', async() => {
    const result = await truffleAssert.fails(
      profile1.getPrivateProfile({ from: user3 })
    );
    assert(!result);
  });

  it('user3 buys Vault access to user1 in the token, and then user3 should be able to get private profile in profile1', async() => {
    await token.getVaultAccess(user1, {from:user3});
    const result = await profile1.getPrivateProfile({from:user3});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes16
      ]
    );
  });

  it('User1 gives key to User4 for profile & documents (ERC 725 10002)', async() => {
    const result = await profile1.addKeyFromAddress(user4, 10002, 1, {from: user1});
    assert(result);
  });

  it('User4 changes public profile', async() => {
    const result = await profile1.setPublicProfile(
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      fileEngine,
      'Another string',
      {from:user4}
    );
    assert(result);
  });

});
