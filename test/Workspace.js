const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Workspace = artifacts.require('Workspace');

// Contract instances.
let token, foundation, workspace1, workspace2;

// "this string just fills a bytes32"
let name1, name2, tagline, url, publicEmail, privateEmail, fileHash;
name1 = name2 = tagline = url = publicEmail = privateEmail = fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const mobile = '0x74686973206973203136206279746573';
// String.
const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;

contract('Workspace', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const factory = accounts[8];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
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
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  it('Factory should deploy Workspace1 (category 1001 = Freelancer), Workspace2 (category 2001 = MPP, set initial owners to User1 and User2 and give them ERC 725 Management key', async() => {
    // Workspace1
    workspace1 = await Workspace.new(
      foundation.address,
      token.address,
      1001,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(workspace1);
    await foundation.setInitialOwnerInFoundation(workspace1.address, user1, {from: factory});
    await workspace1.addKey(web3.utils.keccak256(user1), 1, 1, {from: factory});
    // Workspace2
    workspace2 = await Workspace.new(
      foundation.address,
      token.address,
      2001,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(workspace2);
    await foundation.setInitialOwnerInFoundation(workspace2.address, user2, {from: factory});
    await workspace2.addKey(web3.utils.keccak256(user2), 1, 1, {from: factory});
  });

  it('User1 should ask Workspace2 in partnership && User2 should accept', async() => {
    await workspace1.requestPartnership(
      workspace2.address,
      '0x91',
      { from: user1 }
    );
    await workspace2.authorizePartnership(
      workspace1.address,
      '0x92',
      { from: user2 }
    );
    const result1 = await workspace2.isPartnershipMember({ from: user1 });
    assert(result1);
    const result2 = await workspace1.isPartnershipMember({ from: user2 });
    assert(result2);
  });

  it('User1 should add User3 as a member, User3 should be a partnerShip member of Workspace2', async() => {
    await foundation.addMember(user3, {from: user1});
    const result1 = await foundation.membersToContracts(user3);
    assert.equal(result1, workspace1.address);
    const result2 = await workspace2.isPartnershipMember({from: user3});
    assert(result2);
  });

  it('User1 should destroy his Workspace', async() => {
    const result = await workspace1.destroyWorkspace({from: user1});
    assert(result);
  });

  it('Workspace1 should not exist any more', async() => {
    truffleAssert.fails(workspace1.identityInformation());
  });

  it('User1 and User3 should not be recognized as partnership members in Workspace2', async() => {
    const result1 = await workspace2.isPartnershipMember({ from: user1 });
    assert(!result1);
    const result2 = await workspace2.isPartnershipMember({ from: user3 });
    assert(!result2);
  });

});
