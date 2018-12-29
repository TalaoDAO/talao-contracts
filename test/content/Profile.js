const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Profile = artifacts.require('ProfileTest');

// Contract instances.
let token, foundation, profile;

// Sample data.
// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const bytes16 = '0x74686973206973203136206279746573';
// String.
const string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;
const privateEmail = '0x71';
const privateMobile = '0x81';

contract('Profile', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const factory = accounts[8];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Profile.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Profile.link(ClaimHolderLibrary, claimHolderLibrary.address);
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
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  // Simple init for initial owners, already tested in OwnableInFoundation.js
  it('Factory should deploy Profile1 (category 1001), set initial owner and give him ERC 725 Management key', async() => {
    profile = await Profile.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    assert(profile);
    await foundation.setInitialOwnerInFoundation(profile.address, user1, {from: factory});
    const user1key = web3.utils.keccak256(user1);
    await profile.addKey(user1key, 1, 1, {from: factory});
  });

  it('User1 should set his profile', async() => {
    const result = await profile.setProfile(
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      fileEngine,
      string,
      privateEmail,
      privateMobile,
      {from:user1}
    );
    assert(result);
  });

  it('In profile, anyone should get public profile', async() => {
    const result = await profile.publicProfile({from: someone});
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

  it('In profile, user1 should get his private profile', async() => {
    const result = await profile.getPrivateProfile({from:user1});
    assert.equal(result[0], privateEmail);
    assert.equal(result[1], privateMobile);
  });

  it('In profile, user3 should not be able to get private profile', async() => {
    const result = await truffleAssert.fails(
      profile.getPrivateProfile({ from: user3 })
    );
    assert(!result);
  });

  it('user3 buys Vault access to user1 in the token, and then user3 should be able to get private profile in profile', async() => {
    await token.getVaultAccess(user1, {from:user3});
    const result = await profile.getPrivateProfile({from:user3});
    assert.equal(result[0], privateEmail);
    assert.equal(result[1], privateMobile);
  });

  it('User1 gives key to User4 for profile & documents (ERC 725 20002)', async() => {
    const user4key = web3.utils.keccak256(user4);
    const result = await profile.addKey(user4key, 20002, 1, {from: user1});
    assert(result);
  });

  it('User4 changes public profile', async() => {
    const result = await profile.setProfile(
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      fileEngine,
      'Another string',
      privateEmail,
      privateMobile,
      {from:user4}
    );
    assert(result);
  });

});
