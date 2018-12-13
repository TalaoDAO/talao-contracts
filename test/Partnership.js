const truffleAssert = require('truffle-assertions');
const Partnership = artifacts.require('Partnership');

contract('Partnership', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  let partnership1, partnership2, partnership3, partnership4;
  let result, result1, result2, result3, result4;

  it('Should deploy partnership1 (category 1), partnership2 (category 2), partnership3 (category 255 = max) and partnership4 (category 2) contracts', async() => {
    partnership1 = await Partnership.new(1);
    partnership2 = await Partnership.new(2);
    partnership3 = await Partnership.new(255);
    partnership4 = await Partnership.new(2);
  });

  it('Should transfer them to user1, user2, user3 and user4', async() => {
    await partnership1.transferOwnership(user1);
    result1 = await partnership1.owner();
    assert.equal(result1, user1);
    await partnership2.transferOwnership(user2);
    result2 = await partnership2.owner();
    assert.equal(result2, user2);
    await partnership3.transferOwnership(user3);
    result3 = await partnership3.owner();
    assert.equal(result3, user3);
    await partnership4.transferOwnership(user4);
    result4 = await partnership4.owner();
    assert.equal(result4, user4);
  });

  it('user1 should request partnership of his contract partnership1 to the contract partnership2', async() => {
    result = await partnership1.requestPartnership(partnership2.address, { from: user1 });
    assert(result);
  });

  it('PartnershipRequested event should have been emitted by partnership2 contract', async() => {
    truffleAssert.eventEmitted(result, 'PartnershipRequested');
  });

  it('user1 should get his partnership1 contract status in partnership2 and it should be Pending', async() => {
    result = await partnership1.getPartnershipAuthorization(partnership2.address, { from: user1 });
    assert.equal(result.toNumber(), 2);
  });

  it('user2 should be recognized as an authorized partner owner in partnership1.', async() => {
    result = await partnership1.isAuthorizedPartnershipOwner({ from: user2 });
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
    result = await partnership2.isAuthorizedPartnershipOwner({ from: user1 });
    assert(result);
  });

  it('user3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    await partnership3.requestPartnership(partnership2.address, { from: user3 });
  });

  it('user2 should get his knowns partners and the result should be an array of partnership1 & partnership3 addresses', async() => {
    result = await partnership2.getPartnerships({ from: user2 });
    assert.equal(result.toString(), [partnership1.address, partnership3.address]);
  });

  it('user2 should get partnership1 information by its contract address', async() => {
    result = await partnership2.getPartnershipByContract(partnership1.address, { from: user2 });
    assert.equal(result[0], 1);
    assert.equal(result[1], 1);
    assert.equal(result[2], user1);
  });

  it('user2 should get partnership1 information by user1\'s Ethereum address', async() => {
    result = await partnership2.getPartnershipByOwner(user1, { from: user2 });
    assert.equal(result[0], 1);
    assert.equal(result[1], 1);
    assert.equal(result[2], partnership1.address);
  });

  it('user1 should get partnership2 information by its contract address', async() => {
    result = await partnership1.getPartnershipByContract(partnership2.address, { from: user1 });
    assert.equal(result[0], 2);
    assert.equal(result[1], 1);
    assert.equal(result[2], user2);
  });

  it('user1 should get partnership2 information by user2\'s Ethereum address', async() => {
    result = await partnership1.getPartnershipByOwner(user2, { from: user1 });
    assert.equal(result[0], 2);
    assert.equal(result[1], 1);
    assert.equal(result[2], partnership2.address);
  });

  it('user2 should reject partnership3 in his contract partnership2.', async() => {
    result = await partnership2.rejectPartnership(partnership3.address, { from: user2 });
    assert(result);
  });

  it('user3 should not be an authorized partner owner in partnership2.', async() => {
    result = await partnership2.isAuthorizedPartnershipOwner({ from: user3 });
    assert(!result);
  });

  it('user3 should remove partner2, both should have Unknown authorization (reset)', async() => {
    result = await partnership3.removePartnership(partnership2.address, { from: user3 });
    assert(result);
    result1 = await partnership3.getPartnershipAuthorization(partnership2.address, { from: user3 });
    assert.equal(result1.toNumber(), 0);
    result2 = await partnership2.getPartnershipAuthorization(partnership3.address, { from: user2 });
    assert.equal(result2.toNumber(), 0);
  });

  it('user3 should request partnership of his contract partnership3 to the partnership2 contract', async() => {
    await partnership3.requestPartnership(partnership2.address, { from: user3 });
  });

  it('user2 should authorize partnership3 in his contract partnership2.', async() => {
    result = await partnership2.authorizePartnership(partnership3.address, { from: user2 });
    assert(result);
  });

  it('user3 should be recognized as an authorized partner owner in partnership2.', async() => {
    result = await partnership2.isAuthorizedPartnershipOwner({ from: user3 });
    assert(result);
  });

  it('user4 should not be able to request partnership of his contract partnership4 to the contract partnership2 because they have the same category', async() => {
    result = await truffleAssert.fails(
      partnership4.requestPartnership(partnership2.address, { from: user4 })
    )
    assert(!result);
  });

  it('user3 should transfer partnership3 contract to user5', async() => {
    await partnership3.transferOwnership(user5, { from: user3 });
    result = await partnership3.owner();
    assert.equal(result, user5);
  });

  it('user5 should execute updatePartnershipsOwner as the owner in partnership3', async() => {
    result = await partnership3.updatePartnershipsOwner({ from: user5 });
    assert(result);
  });

  it('user5 should be recognized as an autorized partner owner in partnership2, because partnership3 that was transfered to him is a partner of partnership2', async() => {
    result = await partnership2.isAuthorizedPartnershipOwner({ from: user5 });
    assert(result);
  });

  it('user3 should be not be an autorized partner owner in partnership2 anymore because he transfered this contract to user5 and user5 did execute updatePartnershipsOwner', async() => {
    result = await partnership2.isAuthorizedPartnershipOwner({ from: user5 });
    assert(result);
  });

  it('user2 should get partnership3 information by its contract address', async() => {
    result = await partnership2.getPartnershipByContract(partnership3.address, { from: user2 });
    assert.equal(result[0], 255);
    assert.equal(result[1], 1);
    assert.equal(result[2], user5);
  });

  it('user2 should get partnership3 information by user5\'s Ethereum address', async() => {
    result = await partnership2.getPartnershipByOwner(user5, { from: user2 });
    assert.equal(result[0], 255);
    assert.equal(result[1], 1);
    assert.equal(result[2], partnership3.address);
  });

});
