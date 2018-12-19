const truffleAssert = require('truffle-assertions');
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
  let partnership1, partnership2, partnership3, partnership4;
  let result, result1, result2, result3, result4;

  it('Should deploy Foundation contract and register a Factory contract', async() => {
    foundation = await Foundation.new();
    assert(foundation);
    // It's only a simulation of a factory contract, otherwise I would have to create one just for this test.
    result = await foundation.addFactory(factory);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('Factory should deploy partnership1 (category 1), partnership2 (category 2), partnership3 (category 255 = max) and partnership4 (category 2) contracts', async() => {
    partnership1 = await Partnership.new(foundation.address, 1, {from: factory});
    partnership2 = await Partnership.new(foundation.address, 2, {from: factory});
    partnership3 = await Partnership.new(foundation.address, 255, {from: factory});
    partnership4 = await Partnership.new(foundation.address, 2, {from: factory});
  });

  it('Should register them to user1, user2, user3 and user4', async() => {
    await foundation.setInitialOwnerInFoundation(partnership1.address, user1, {from: factory});
    result1 = await foundation.contractsToOwners(partnership1.address);
    assert.equal(result1, user1);
    await foundation.setInitialOwnerInFoundation(partnership2.address, user2, {from: factory});
    result2 = await foundation.contractsToOwners(partnership2.address);
    assert.equal(result2, user2);
    await foundation.setInitialOwnerInFoundation(partnership3.address, user3, {from: factory});
    result3 = await foundation.contractsToOwners(partnership3.address);
    assert.equal(result3, user3);
    await foundation.setInitialOwnerInFoundation(partnership4.address, user4, {from: factory});
    result4 = await foundation.contractsToOwners(partnership4.address);
    assert.equal(result4, user4);
  });

  it('user1 should request partnership of his contract partnership1 to the contract partnership2', async() => {
    result = await partnership1.requestPartnership(partnership2.address, { from: user1 });
    assert(result);
  });

  it('PartnershipRequested event should have been emitted by partnership2 contract', async() => {
    truffleAssert.eventEmitted(result, 'PartnershipRequested');
  });

  it('user1 should get his partnership status in partnership2 and it should be Pending', async() => {
    result = await partnership2.getMyPartnershipStatus({ from: user1 });
    assert.equal(result.toNumber(), 2);
  });

  it('user2 should be recognized as an authorized partner owner in partnership1.', async() => {
    result = await partnership1.isPartnershipMember({ from: user2 });
    assert(result);
  });

  it('user2 should authorize partnership1 in his contract partnership2.', async() => {
    result = await partnership2.authorizePartnership(partnership1.address, { from: user2 });
    assert(result);
  });

  it('PartnershipAccepted event should have been emitted by partner1 contract, triggered by partner2', async() => {
    truffleAssert.eventEmitted(result, 'PartnershipAccepted');
  });

  it('user1 should now be recognized as an authorized partner owner in partnership2.', async() => {
    result = await partnership2.isPartnershipMember({ from: user1 });
    assert(result);
  });

  it('user3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    await partnership3.requestPartnership(partnership2.address, { from: user3 });
  });

  it('user2 should get his knowns partners and the result should be an array of partnership1 & partnership3 addresses', async() => {
    result = await partnership2.getKnownPartnershipsContracts({ from: user2 });
    assert.equal(result.toString(), [partnership1.address, partnership3.address]);
  });

  it('user2 should get partnership1 information in his contract', async() => {
    result = await partnership2.getPartnership(partnership1.address, { from: user2 });
    assert.equal(result[0], user1);
    assert.equal(result[1], 1);
    assert.equal(result[2], 1);
  });

  it('user1 should get partnership2 information in his contract', async() => {
    result = await partnership1.getPartnership(partnership2.address, { from: user1 });
    assert.equal(result[0], user2);
    assert.equal(result[1], 2);
    assert.equal(result[2], 1);
  });

  it('user2 should reject partnership3 in his contract partnership2.', async() => {
    result = await partnership2.rejectPartnership(partnership3.address, { from: user2 });
    assert(result);
  });

  it('user3 should not be an authorized partner owner in partnership2.', async() => {
    result = await partnership2.isPartnershipMember({ from: user3 });
    assert(!result);
  });

  it('user3 should remove partner2, both should have Removed authorization', async() => {
    result = await partnership3.removePartnership(partnership2.address, { from: user3 });
    assert(result);
    result1 = await partnership3.getMyPartnershipStatus({ from: user2 });
    assert.equal(result1.toNumber(), 4);
    result2 = await partnership2.getMyPartnershipStatus({ from: user3 });
    assert.equal(result2.toNumber(), 4);
  });

  it('user3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    await partnership3.requestPartnership(partnership2.address, { from: user3 });
  });

  it('user2 should authorize partnership3 in his contract partnership2.', async() => {
    result = await partnership2.authorizePartnership(partnership3.address, { from: user2 });
    assert(result);
  });

  it('user3 should be recognized as an authorized partner owner in partnership2.', async() => {
    result = await partnership2.isPartnershipMember({ from: user3 });
    assert(result);
  });

  it('user4 should not be able to request partnership of his contract partnership4 to the contract partnership2 because they have the same category', async() => {
    result = await truffleAssert.fails(
      partnership4.requestPartnership(partnership2.address, { from: user4 })
    )
    assert(!result);
  });

  it('User5 is not a member of User3\'s contract, so he should not be recognized as a partnership member in Partnership2', async() => {
    result = await partnership2.isPartnershipMember({from: user4});
    assert(!result);
  });

  it('User3 is a marketplace owner, he should add User5 as a member of his contract', async() => {
    await foundation.addMember(user5, {from: user3});
  });

  it('User5 is a member of User3\'s contract, so he should be recognized as a partnership member in Partnership2', async() => {
    result = await partnership2.isPartnershipMember({from: user5});
    assert(result);
  });

  it('User3 should remove User5 as a member of his contract', async() => {
    await foundation.removeMember(user5, {from: user3});
  });

  it('User5 is not a member of User3\'s contract any more, so he should not be recognized any more as a partnership member in Partnership2', async() => {
    result = await partnership2.isPartnershipMember({from: user5});
    assert(result);
  });

  it('user3 should transfer partnership3 contract to user6', async() => {
    await foundation.transferOwnershipInFoundation(partnership3.address, user6, { from: user3 });
    result = await foundation.contractsToOwners(partnership3.address, {from: someone});
    assert.equal(result, user6);
  });

  it('User6 should be recognized as an autorized partner member in partnership2, because partnership3 that was transfered to him is a partner of partnership2', async() => {
    result = await partnership2.isPartnershipMember({ from: user6 });
    assert(result);
  });

  it('user3 should be not be an autorized partner member in partnership2 anymore because he transfered this contract to User6', async() => {
    result = await partnership2.isPartnershipMember({ from: user3 });
    assert(!result);
  });

  it('user2 should get partnership3 information by its contract address', async() => {
    result = await partnership2.getPartnership(partnership3.address, { from: user2 });
    assert.equal(result[0], user6);
    assert.equal(result[1], 255);
    assert.equal(result[2], 1);
  });

});
