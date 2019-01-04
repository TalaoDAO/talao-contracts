const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Permissions = artifacts.require('Permissions');

// Contract instances.
let foundation, token, keyHolderLibrary, claimHolderLibrary, permissions1, permissions2;

contract('Permissions', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const contract5 = accounts[5];
  const factory = accounts[8];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Permissions.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Permissions.link(ClaimHolderLibrary, claimHolderLibrary.address);
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
  it('Factory should deploy Permissions1 (category 1001) and Permissions2 (category 2001), set initial owners to User1 and User2, , and add an ERC 725 key 1 = management for each of them', async() => {
    permissions1 = await Permissions.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    assert(permissions1);
    await foundation.setInitialOwnerInFoundation(permissions1.address, user1, {from: factory});
    const user1key = web3.utils.keccak256(user1);
    await permissions1.addKey(user1key, 1, 1, {from: factory});
    permissions2 = await Permissions.new(
      foundation.address,
      token.address,
      2001,
      1,
      1,
      '0x21',
      '0x22',
      {from: factory}
    );
    assert(permissions2);
    await foundation.setInitialOwnerInFoundation(permissions2.address, user2, {from: factory});
    const user2key = web3.utils.keccak256(user2);
    await permissions2.addKey(user2key, 1, 1, {from: factory});
  });

  it('User1 should be able to read from Permissions1', async() => {
    const result = await permissions1.isReader({from: user1});
    assert(result);
  });

  it('User3 should not be able to read from Permissions1', async() => {
    const result = await permissions1.isReader({from: user3});
    assert(!result);
  });

  it('User3 buys Vault access for User1 and then, should be able to read from Permissions1', async() => {
    await token.getVaultAccess(user1, {from: user3});
    const result = await permissions1.isReader({from: user3});
    assert(result);
  });

  it('User2 should not be able to read from Permissions1', async() => {
    const result = await permissions1.isReader({from: user2});
    assert(!result);
  });

  it('User2 asks partnership with Permissions1, User1 accepts, and then User2 should be able to read from Permissions1', async() => {
    await permissions2.requestPartnership(
      permissions1.address,
      '0x92',
      {from: user2}
    );
    await permissions1.authorizePartnership(
      permissions2.address,
      '0x91',
      {from: user1}
    );
    const result = await permissions1.isReader({from: user2});
    assert(result);
  });

  it('User1 closes Vault access, and User2 should not be able to read from Permissions1 anymore', async() => {
    await token.closeVaultAccess({from:user1});
    const result = await permissions1.isReader({from: user2});
    assert(!result);
  });

  it('Anyone should be able to read from Permissions2 because access if free and User2 has open Vault', async() => {
    const result = await permissions2.isReader({from: someone});
    assert(result);
  });

  it('User2 closes Vault access, no one except User2 should be able to read from Permissions2 anymore, even partners', async() => {
    await token.closeVaultAccess({from:user2});
    const result1 = await permissions2.isReader({from: someone});
    assert(!result1);
    const result2 = await permissions2.isReader({from: user1});
    assert(!result2);
  });

  it('User2 opens Vault access again', async() => {
    const result = await token.createVaultAccess(10, {from:user2});
    assert(result);
  });

  it('User4 is not a member of Permissions2, he should not be able to read its "private" content', async() => {
    const result = await permissions2.isReader({from: user4});
    assert(!result);
  });

  it('User2 adds User4 as a member', async() => {
    const result = await foundation.addMember(user4, {from: user2});
    assert(result);
  });

  it('User4 is a member of Permissions2, he should be able to read its "private" content', async() => {
    const result = await permissions2.isReader({from: user4});
    assert(result);
  });

  it('User2 an ERC 725 20001 key "Reader" to contract5. Contract5 should be able to read its "private" content', async() => {
    await permissions2.addKey(web3.utils.keccak256(contract5), 20001, 1, {from: user2});
    const result = await permissions2.isReader({from: contract5});
    assert(result);
  });

  it('User1 opens Vault access again', async() => {
    await token.createVaultAccess(10, {from:user1});
    const result = await permissions1.isReader({from: user1});
    assert(result);
  });

  it('Factory should have ERC 725 key with purpose 1 (Manager)', async() => {
    const result = permissions1.hasIdentityPurpose(1, {from: factory});
    assert(result);
  });

});
