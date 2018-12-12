const truffleAssert = require('truffle-assertions');
const TalaoToken = artifacts.require('TalaoToken');
const Profile = artifacts.require('Profile');

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
  const someone = accounts[9];
  let token;
  let profile1, profile2;
  let result, result1, result2, result3, result4;
  let tx, tx1, tx2, tx3, tx4;

  it('Should init token', async() => {
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

  it('Should deploy Profile contracts and transfer them to users', async() => {
    profile1 = await Profile.new(1, token.address);
    await profile1.transferOwnership(user1);
    profile2 = await Profile.new(2, token.address);
    await profile2.transferOwnership(user2);
  });

  it('In profile1, user1 should set his public profile', async() => {
    tx = await profile1.setPublicProfile(
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      bytes32,
      fileEngine,
      string,
      {from:user1}
    )
  });

  it('In profile1, anyone should get public profile', async() => {
    result = await profile1.publicProfile({from: someone});
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
    tx = await profile1.setPrivateProfile(
      bytes32,
      bytes16,
      {from:user1}
    )
  });

  it('In profile1, user1 should get his private profile', async() => {
    result = await profile1.getPrivateProfile({from:user1});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes16
      ]
    )
  });

  it('In profile1, user2 should not be able to get private profile', async() => {
    result = await truffleAssert.fails(
      profile1.getPrivateProfile({ from: user2 })
    );
    assert(!result);
  });

  it('user2 requests partnership of his profile2 contract with profile1 contract, user1 accepts, and then user2 should be able to get private profile of profile1', async() => {
    await profile2.requestPartnership(profile1.address, {from:user2});
    await profile1.authorizePartnership(profile2.address, {from:user1});
    result = await profile1.getPrivateProfile({from:user2});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes16
      ]
    )
  });

  it('In profile1, user3 should not be able to get private profile', async() => {
    result = await truffleAssert.fails(
      profile1.getPrivateProfile({ from: user3 })
    );
    assert(!result);
  });

  it('user3 buys Vault access to user1 in the token, and then user3 should be able to get private profile in profile1', async() => {
    await token.getVaultAccess(user1, {from:user3});
    result = await profile1.getPrivateProfile({from:user3});
    assert.equal(
      result.toString(),
      [
        bytes32,
        bytes16
      ]
    );
  });

});
