const truffleAssert = require('truffle-assertions');

const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Partnership = artifacts.require('Partnership');

contract('Partnership', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const user6 = accounts[6];
  const someone = accounts[8];
  const factory = accounts[9];
  let foundation;
  let token;
  let partnership1, partnership2, partnership3, partnership4;

  it('Should deploy keyHolderLibrary, link it in ClaimHolderLibrary, deploy claimHolderLibrary, link both libs in Partnership', async() => {
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Partnership.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Partnership.link(ClaimHolderLibrary, claimHolderLibrary.address);
  });

  // Simple init, already fully tested before the ICO.
  it('Should init token with Vault deposit of 100 TALAO and transfer 1000 TALAO to User1, User2 and User3. User1 should create a Vault access with a price of 10 TALAO and User2 should create a free Vault access', async() => {
    token = await TalaoToken.new();
    await token.mint(userRoot, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    await token.createVaultAccess(50, { from: user3 });
  });

  it('Should deploy Foundation contract and register a Factory contract', async() => {
    foundation = await Foundation.new();
    assert(foundation);
    // It's only a simulation of a factory contract, otherwise I would have to create one just for this test.
    const result = await foundation.addFactory(factory);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('Factory should deploy partnership1 (category 1), partnership2 (category 2), partnership3 (category 255 = max) and partnership4 (category 2) contracts', async() => {
    partnership1 = await Partnership.new(foundation.address, token.address, 1, {from: factory});
    partnership2 = await Partnership.new(foundation.address, token.address, 2, {from: factory});
    partnership3 = await Partnership.new(foundation.address, token.address, 255, {from: factory});
    partnership4 = await Partnership.new(foundation.address, token.address, 2, {from: factory});
  });

  it('Should register to User1, User2, User3 and User4, and add an ERC 725 key 1 = management for each of them', async() => {
    await foundation.setInitialOwnerInFoundation(partnership1.address, user1, {from: factory});
    const result1 = await foundation.contractsToOwners(partnership1.address);
    assert.equal(result1, user1);
    const result1b = await partnership1.addKeyFromAddress(user1, 1, 1, {from: factory});
    assert(result1b);
    await foundation.setInitialOwnerInFoundation(partnership2.address, user2, {from: factory});
    const result2 = await foundation.contractsToOwners(partnership2.address);
    assert.equal(result2, user2);
    const result2b = await partnership2.addKeyFromAddress(user2, 1, 1, {from: factory});
    assert(result2b);
    await foundation.setInitialOwnerInFoundation(partnership3.address, user3, {from: factory});
    const result3 = await foundation.contractsToOwners(partnership3.address);
    assert.equal(result3, user3);
    const result3b = await partnership3.addKeyFromAddress(user3, 1, 1, {from: factory});
    assert(result3b);
    await foundation.setInitialOwnerInFoundation(partnership4.address, user4, {from: factory});
    const result4 = await foundation.contractsToOwners(partnership4.address);
    assert.equal(result4, user4);
    const result4b = await partnership4.addKeyFromAddress(user4, 1, 1, {from: factory});
    assert(result4b);
  });

  it('User1 should request partnership of his contract partnership1 to the contract partnership2, PartnershipRequested event should have been emitted by partnership2 contract', async() => {
    const result = await partnership1.requestPartnership(partnership2.address, { from: user1 });
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

  it('User2 should authorize partnership1 in his contract partnership2, PartnershipAccepted event should have been emitted by partner1 contract, triggered by partner2', async() => {
    const result = await partnership2.authorizePartnership(partnership1.address, { from: user2 });
    assert(result);
    truffleAssert.eventEmitted(result, 'PartnershipAccepted');
  });

  it('User1 should now be recognized as an authorized partner owner in partnership2.', async() => {
    const result = await partnership2.isPartnershipMember({ from: user1 });
    assert(result);
  });

  it('User3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    await partnership3.requestPartnership(partnership2.address, { from: user3 });
  });

  it('User2 should get his knowns partners and the result should be an array of partnership1 & partnership3 addresses', async() => {
    const result = await partnership2.getKnownPartnershipsContracts({ from: user2 });
    assert.equal(result.toString(), [partnership1.address, partnership3.address]);
  });

  it('User2 should get partnership1 information in his contract', async() => {
    const result = await partnership2.getPartnership(partnership1.address, { from: user2 });
    assert.equal(result[0], user1);
    assert.equal(result[1], 1);
    assert.equal(result[2], 1);
  });

  it('User1 should get partnership2 information in his contract', async() => {
    const result = await partnership1.getPartnership(partnership2.address, { from: user1 });
    assert.equal(result[0], user2);
    assert.equal(result[1], 2);
    assert.equal(result[2], 1);
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
    await partnership3.requestPartnership(partnership2.address, { from: user3 });
  });

  it('User2 should authorize Partnership3 in his contract Partnership2.', async() => {
    const result = await partnership2.authorizePartnership(partnership3.address, { from: user2 });
    assert(result);
  });

  it('User3 should be recognized as an authorized partner owner in partnership2.', async() => {
    const result = await partnership2.isPartnershipMember({ from: user3 });
    assert(result);
  });

  it('User4 should not be able to request partnership of his contract partnership4 to the contract partnership2 because they have the same category', async() => {
    const result = await truffleAssert.fails(
      partnership4.requestPartnership(partnership2.address, { from: user4 })
    )
    assert(!result);
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
    assert.equal(result[1], 255);
    assert.equal(result[2], 1);
  });

  it('User2 should have 2 partnerships', async() => {
    const result = await partnership2.partnershipsNumber();
    assert.equal(result.toNumber(), 2);
  });

  it('User2 should remove partnership with Partnership3', async() => {
    const result = await partnership2.removePartnership(partnership3.address, {from: user2});
    assert(result);
  });

  it('User2 should have 1 partnerships', async() => {
    const result = await partnership2.partnershipsNumber();
    assert.equal(result.toNumber(), 1);
  });

});
