const truffleAssert = require('truffle-assertions');
const Partner = artifacts.require('Partner');

contract('Partner', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  let InstancePartner1, InstancePartner2, InstancePartner3;
  let result, result1, result2, result3;
  let tx, tx1, tx2, tx3;

  it('Should deploy InstancePartner1 (category 1), InstancePartner2 (category 2) and InstancePartner3 (category 255 = max) contracts', async() => {
    InstancePartner1 = await Partner.new(1);
    InstancePartner2 = await Partner.new(2);
    InstancePartner3 = await Partner.new(255);
  });

  it('Should transfer them to user1, user2 and user3', async() => {
    await InstancePartner1.transferOwnership(user1);
    result1 = await InstancePartner1.owner();
    assert.equal(result1, user1);
    await InstancePartner2.transferOwnership(user2);
    result2 = await InstancePartner2.owner();
    assert.equal(result2, user2);
    await InstancePartner3.transferOwnership(user3);
    result3 = await InstancePartner3.owner();
    assert.equal(result3, user3);
  });

  it('user1 should request partnership of his contract Partner1 to the contract Partner2', async() => {
    tx = await InstancePartner1.requestPartnership(InstancePartner2.address, { from: user1 });
    assert(tx);
  });

  it('PartnershipAsked event should have been emitted by Partner2 contract', async() => {
    truffleAssert.eventEmitted(tx, 'PartnershipAsked');
  });

  it('Partner1 should be in pending approval in Partner2', async() => {
    result = await InstancePartner2.returnPartnershipStatus({ from: InstancePartner1.address});
    assert.equal(result.toNumber(), 2);
  });

  it('user1 should get his Partner1 contract status in Partner2', async() => {
    result = await InstancePartner1.getPartnershipStatus(InstancePartner2.address, { from: user1 });
    assert.equal(result.toNumber(), 2);
  });

  it('Partner2 should have been added as an authorized partner in Partner1.', async() => {
    result = await InstancePartner1.isPartner({ from: InstancePartner2.address});
    assert(result);
  });

  it('user2 should authorize Partner1 in his contract Partner2.', async() => {
    tx = await InstancePartner2.authorizePartner(InstancePartner1.address, { from: user2 });
    assert(tx);
  });

  it('Partner1 should have been added as an authorized partner in Partner2.', async() => {
    result = await InstancePartner2.isPartner({ from: InstancePartner1.address});
    assert(result);
  });

  it('user3 should request partnership of his contract Partner3 to the Partner2 contract', async() => {
    await InstancePartner3.requestPartnership(InstancePartner2.address, { from: user3 });
  });

  it('user2 should get his knowns partners and the result should be an array of Partner1 & Partner3 addresses', async() => {
    result = await InstancePartner2.getPartners({ from: user2 });
    assert.equal(result.toString(), [InstancePartner1.address, InstancePartner3.address]);
  });

  it('user2 should get Partner3 Partner information', async() => {
    result = await InstancePartner2.getPartner(InstancePartner3.address, { from: user2 });
    assert.equal(result[0], 255);
    assert.equal(result[1], 2);
  });

  it('user2 should reject Partner3 in his contract Partner2.', async() => {
    tx = await InstancePartner2.rejectPartner(InstancePartner3.address, { from: user2 });
    assert(tx);
  });

  it('Partner3 should be rejected in Partner2', async() => {
    result = await InstancePartner2.returnPartnershipStatus({ from: InstancePartner3.address});
    assert.equal(result.toNumber(), 3);
  });

  it('user2 should authorize Partner3 in his contract Partner2.', async() => {
    tx = await InstancePartner2.authorizePartner(InstancePartner3.address, { from: user2 });
    assert(tx);
  });

  it('Partner3 should be an authorized partner in Partner2.', async() => {
    result = await InstancePartner2.isPartner({ from: InstancePartner3.address});
    assert(result);
  });

});
