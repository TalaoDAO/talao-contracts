const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Partnership = artifacts.require('Partnership');

// Contract instances.
let foundation, token, partnership1, partnership2, partnership3;

contract('Partnership', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const user6 = accounts[6];
  const contract7 = accounts[7];
  const someone = accounts[8];
  const factory = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Partnership.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Partnership.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // 2. Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(defaultUser, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.transfer(user4, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    await token.createVaultAccess(50, { from: user3 });
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  // Note: encryptions are simulated here because they would clutter the test.
  // See Identity.js for full encryption tests.

  it('Factory should deploy partnership1 (category 1001), partnership2 (category 2001), partnership3 (category 3001) and partnership4 (category 2001) contracts', async() => {
    partnership1 = await Partnership.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    partnership2 = await Partnership.new(
      foundation.address,
      token.address,
      2001,
      1,
      1,
      '0x21',
      '0x22',
      {from: factory}
    );
    partnership3 = await Partnership.new(
      foundation.address,
      token.address,
      3001,
      1,
      1,
      '0x31',
      '0x32',
      {from: factory}
    );
  });

  it('Should register to User1, User2 and User3 and add an ERC 725 key 1 = management for each of them', async() => {
    await foundation.setInitialOwnerInFoundation(partnership1.address, user1, {from: factory});
    const result1 = await foundation.contractsToOwners(partnership1.address);
    assert.equal(result1, user1);
    const user1key = web3.utils.keccak256(user1);
    const result1b = await partnership1.addKey(user1key, 1, 1, {from: factory});
    assert(result1b);
    await foundation.setInitialOwnerInFoundation(partnership2.address, user2, {from: factory});
    const result2 = await foundation.contractsToOwners(partnership2.address);
    assert.equal(result2, user2);
    const user2key = web3.utils.keccak256(user2);
    const result2b = await partnership2.addKey(user2key, 1, 1, {from: factory});
    assert(result2b);
    await foundation.setInitialOwnerInFoundation(partnership3.address, user3, {from: factory});
    const result3 = await foundation.contractsToOwners(partnership3.address);
    assert.equal(result3, user3);
    const user3key = web3.utils.keccak256(user3);
    const result3b = await partnership3.addKey(user3key, 1, 1, {from: factory});
    assert(result3b);
  });

  it('User1 should request partnership of his contract partnership1 to the contract partnership2, PartnershipRequested event should have been emitted by partnership2 contract', async() => {
    // 0x91 is a simulation of encrypted passphrase.
    const result = await partnership1.requestPartnership(
      partnership2.address,
      '0x91',
      { from: user1 }
    );
    assert(result);
    truffleAssert.eventEmitted(result, 'PartnershipRequested');
  });

  it('User1 should get his partnership status in partnership2 and it should be Pending', async() => {
    const result = await partnership2.getMyPartnershipStatus({ from: user1 });
    assert.equal(result.toNumber(), 2);
  });

  it('User2 should be recognized as an authorized partner owner in partnership1.', async() => {
    const result = await partnership1.isPartnershipMember({ from: user2 });
    assert(result);
  });

  it('User2 should have an ERC 725 "Claim" key in partnership1', async() => {
    const user2key = web3.utils.keccak256(user2);
    const result = await partnership1.getKeyPurposes(user2key, {from: someone});
    assert.equal(result.toString(), [
      3
    ]);
  });

  it('User2 should authorize partnership1 in his contract partnership2, PartnershipAccepted event should have been emitted by partner1 contract, triggered by partner2', async() => {
    // 0x92 is a simulation of encrypted passphrase.
    const result = await partnership2.authorizePartnership(
      partnership1.address,
      '0x92',
      { from: user2 }
    );
    assert(result);
    truffleAssert.eventEmitted(result, 'PartnershipAccepted');
  });

  it('User1 should now be recognized as an authorized partner owner in partnership2.', async() => {
    const result = await partnership2.isPartnershipMember({ from: user1 });
    assert(result);
  });

  it('User1 should have an ERC 725 "Claim" key in partnership2', async() => {
    const user1key = web3.utils.keccak256(user1);
    const result = await partnership2.getKeyPurposes(user1key, {from: someone});
    assert.equal(result.toString(), [
      3
    ]);
  });

  it('User3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    const result = await partnership3.requestPartnership(
      partnership2.address,
      '0x93',
      { from: user3 }
    );
    assert(result);
  });

  it('User2 should get his knowns partners and the result should be an array of partnership1 & partnership3 addresses', async() => {
    const result = await partnership2.getKnownPartnershipsContracts({ from: user2 });
    assert.equal(result.toString(), [partnership1.address, partnership3.address]);
  });

  it('User2 should get partnership1 information in his contract', async() => {
    const result = await partnership2.getPartnership(partnership1.address, {from: user2});
    assert.equal(result[0], user1);
    assert.equal(result[1], 1001);
    assert.equal(result[2], 1);
    const now = Date.now();
    assert.isBelow(result[3].toNumber(), now);
    assert.equal(result[4], '0x91');
  });

  it('User1 should get partnership2 information in his contract', async() => {
    const result = await partnership1.getPartnership(partnership2.address, { from: user1 });
    assert.equal(result[0], user2);
    assert.equal(result[1], 2001);
    assert.equal(result[2], 1);
    const now = Date.now();
    assert.isBelow(result[3].toNumber(), now);
    assert.equal(result[4], '0x92');
  });

  it('User2 should reject partnership3 in his contract partnership2.', async() => {
    const result = await partnership2.rejectPartnership(partnership3.address, { from: user2 });
    assert(result);
  });

  it('User3 should not be an authorized partner owner in partnership2.', async() => {
    const result = await partnership2.isPartnershipMember({ from: user3 });
    assert(!result);
  });

  it('User3 should remove partner2, both should have Removed authorization', async() => {
    const result = await partnership3.removePartnership(partnership2.address, { from: user3 });
    assert(result);
    const result1 = await partnership3.getMyPartnershipStatus({ from: user2 });
    assert.equal(result1.toNumber(), 4);
    const result2 = await partnership2.getMyPartnershipStatus({ from: user3 });
    assert.equal(result2.toNumber(), 4);
  });

  it('User3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    const result = await partnership3.requestPartnership(
      partnership2.address,
      '0x93',
      {from: user3}
    );
    assert(result);
  });

  it('User2 should authorize Partnership3 in his contract Partnership2.', async() => {
    const result = await partnership2.authorizePartnership(
      partnership3.address,
      '0x92',
      { from: user2 }
    );
    assert(result);
  });

  it('User3 should be recognized as an authorized partner owner in partnership2.', async() => {
    const result = await partnership2.isPartnershipMember({ from: user3 });
    assert(result);
  });

  it('User5 is not a member of User3\'s contract, so he should not be recognized as a partnership member in Partnership2', async() => {
    const result = await partnership2.isPartnershipMember({from: user4});
    assert(!result);
  });

  it('User3 is a marketplace owner, he should add User5 as a member of his contract', async() => {
    await foundation.addMember(user5, {from: user3});
  });

  it('User5 is a member of User3\'s contract, so he should be recognized as a partnership member in Partnership2', async() => {
    const result = await partnership2.isPartnershipMember({from: user5});
    assert(result);
  });

  it('User3 should remove User5 as a member of his contract', async() => {
    await foundation.removeMember(user5, {from: user3});
  });

  it('User5 is not a member of User3\'s contract any more, so he should not be recognized any more as a partnership member in Partnership2', async() => {
    const result = await partnership2.isPartnershipMember({from: user5});
    assert(!result);
  });

  it('User3 should transfer partnership3 contract to user6', async() => {
    await foundation.transferOwnershipInFoundation(partnership3.address, user6, { from: user3 });
    result = await foundation.contractsToOwners(partnership3.address, {from: someone});
    assert.equal(result, user6);
  });

  it('User6 should be recognized as an autorized partner member in partnership2, because partnership3 that was transfered to him is a partner of partnership2', async() => {
    const result = await partnership2.isPartnershipMember({ from: user6 });
    assert(result);
  });

  it('User3 should be not be an autorized partner member in partnership2 anymore because he transfered this contract to User6', async() => {
    const result = await partnership2.isPartnershipMember({ from: user3 });
    assert(!result);
  });

  it('User2 should get partnership3 information by its contract address', async() => {
    const result = await partnership2.getPartnership(partnership3.address, { from: user2 });
    assert.equal(result[0], user6);
    assert.equal(result[1], 3001);
    assert.equal(result[2], 1);
    const now = Date.now();
    assert.isBelow(result[3].toNumber(), now);
    assert.equal(result[4], '0x93');
  });

  it('User2 should have 2 partnerships', async() => {
    const result = await partnership2.partnershipsNumber();
    assert.equal(result.toNumber(), 2);
  });

  // See also ../test/Service1.js
  it('User2 should add ERC 725 key 20003 to Contract7 so it can read partnerships', async() =>  {
    await partnership2.addKey(web3.utils.keccak256(contract7), 20003, 1, {from: user2});
    const result = await partnership2.getKnownPartnershipsContracts({ from: contract7 });
    assert.equal(result.toString(), [partnership1.address, partnership3.address]);
  });

  it('User2 should add ERC 725 key 1 to User4 so he can manage partnerships', async() =>  {
    await partnership2.addKey(web3.utils.keccak256(user4), 1, 1, {from: user2});
    const result = await partnership2.hasIdentityPurpose(1, {from: user4});
    assert(result);
  });

  it('User4 should remove partnership of Partnership2 with Partnership3', async() =>  {
    const result = await partnership2.removePartnership(partnership3.address, {from: user4});
    assert(result);
  });

  it('User2 should have 1 partnership in Partnership2', async() => {
    const result = await partnership2.partnershipsNumber();
    assert.equal(result.toNumber(), 1);
  });

});
