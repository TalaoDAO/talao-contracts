const truffleAssert = require('truffle-assertions');
const Partner = artifacts.require('Partner');

contract('Partner', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  let InstancePartner1, InstancePartner2, InstancePartner3, InstancePartner4;
  let result, result1, result2, result3, result4;
  let tx, tx1, tx2, tx3;

  it('Should deploy InstancePartner1 (category 1), InstancePartner2 (category 2), InstancePartner3 (category 255 = max) and InstancePartner4 (category 2) contracts', async() => {
    InstancePartner1 = await Partner.new(1);
    InstancePartner2 = await Partner.new(2);
    InstancePartner3 = await Partner.new(255);
    InstancePartner4 = await Partner.new(2);
  });

  it('Should transfer them to user1, user2, user3 and user4', async() => {
    await InstancePartner1.transferOwnership(user1);
    result1 = await InstancePartner1.owner();
    assert.equal(result1, user1);
    await InstancePartner2.transferOwnership(user2);
    result2 = await InstancePartner2.owner();
    assert.equal(result2, user2);
    await InstancePartner3.transferOwnership(user3);
    result3 = await InstancePartner3.owner();
    assert.equal(result3, user3);
    await InstancePartner4.transferOwnership(user4);
    result4 = await InstancePartner4.owner();
    assert.equal(result4, user4);
  });

  it('user1 should request partnership of his contract Partner1 to the contract Partner2', async() => {
    tx = await InstancePartner1.requestPartnership(InstancePartner2.address, { from: user1 });
    assert(tx);
  });

  it('PartnershipRequested event should have been emitted by Partner2 contract', async() => {
    truffleAssert.eventEmitted(tx, 'PartnershipRequested');
  });

  it('user1 should get his Partner1 contract status in Partner2 and it should be Pending', async() => {
    result = await InstancePartner1.getPartnerAuthorization(InstancePartner2.address, { from: user1 });
    assert.equal(result.toNumber(), 2);
  });

  it('user2 should be recognized as an authorized partner owner in Partner1.', async() => {
    result = await InstancePartner1.isAuthorizedPartnerOwner({ from: user2 });
    assert(result);
  });

  it('user2 should authorize Partner1 in his contract Partner2.', async() => {
    tx = await InstancePartner2.authorizePartner(InstancePartner1.address, { from: user2 });
    assert(tx);
  });

  it('user1 should now be recognized as an authorized partner owner in Partner2.', async() => {
    result = await InstancePartner2.isAuthorizedPartnerOwner({ from: user1 });
    assert(result);
  });

  it('PartnershipAccepted event should have been emitted by partner3 contract, triggered by partner2', async() => {
    truffleAssert.eventEmitted(tx, 'PartnershipAccepted');
  });

  it('user3 should request partnership of his contract Partner3 to the Partner2 contract', async() => {
    await InstancePartner3.requestPartnership(InstancePartner2.address, { from: user3 });
  });

  it('user2 should get his knowns partners and the result should be an array of Partner1 & Partner3 addresses', async() => {
    result = await InstancePartner2.getPartners({ from: user2 });
    assert.equal(result.toString(), [InstancePartner1.address, InstancePartner3.address]);
  });

  it('user2 should get Partner1 information', async() => {
    result = await InstancePartner2.getPartner(InstancePartner1.address, { from: user2 });
    assert.equal(result[0], 1);
    assert.equal(result[1], 1);
    assert.equal(result[2], user1);
  });

  it('user2 should reject Partner3 in his contract Partner2.', async() => {
    tx = await InstancePartner2.rejectPartner(InstancePartner3.address, { from: user2 });
    assert(tx);
  });

  it('user3 should not be an authorized partner owner in Partner2.', async() => {
    result = await InstancePartner2.isAuthorizedPartnerOwner({ from: user3 });
    assert(!result);
  });

  it('user3 should remove partner2, both should have Unknown authorization (reset)', async() => {
    tx = await InstancePartner3.removePartner(InstancePartner2.address, { from: user3 });
    assert(tx);
    result1 = await InstancePartner3.getPartnerAuthorization(InstancePartner2.address, { from: user3 });
    assert.equal(result1.toNumber(), 0);
    result2 = await InstancePartner2.getPartnerAuthorization(InstancePartner3.address, { from: user2 });
    assert.equal(result2.toNumber(), 0);
  });

  it('user3 should request partnership of his contract Partner3 to the Partner2 contract', async() => {
    await InstancePartner3.requestPartnership(InstancePartner2.address, { from: user3 });
  });

  it('user2 should authorize Partner3 in his contract Partner2.', async() => {
    tx = await InstancePartner2.authorizePartner(InstancePartner3.address, { from: user2 });
    assert(tx);
  });

  it('user3 should be recognized as an authorized partner owner in Partner2.', async() => {
    result = await InstancePartner2.isAuthorizedPartnerOwner({ from: user3 });
    assert(result);
  });

  it('user4 should not be able to request partnership of his contract Partner4 to the contract Partner2 because they have the same category', async() => {
    result = await truffleAssert.fails(
      InstancePartner4.requestPartnership(InstancePartner2.address, { from: user4 })
    )
    assert(!result);
  });

  it('user3 should transfer Partner3 contract to user5', async() => {
    await InstancePartner3.transferOwnership(user5, { from: user3 });
    result = await InstancePartner3.owner();
    assert.equal(result, user5);
  });

  it('user5 should execute updatePartnerOwner as the owner in Partner3', async() => {
    tx = await InstancePartner3.updatePartnerOwner({ from: user5 });
    assert(tx);
  });

  it('user5 should be recognized as an autorized partner owner in Partner2, because Partner3 that was transfered to him is a partner of Partner2', async() => {
    result = await InstancePartner2.isAuthorizedPartnerOwner({ from: user5 });
    assert(result);
  });

  it('user3 should be not be an autorized partner owner in Partner2 anymore because he transfered this contract to user5 and user5 did execute updatePartnerOwner', async() => {
    result = await InstancePartner2.isAuthorizedPartnerOwner({ from: user5 });
    assert(result);
  });

});
