const truffleAssert = require('truffle-assertions');
const PartnerInherited1 = artifacts.require('PartnerInherited1');
const PartnerInherited2 = artifacts.require('PartnerInherited2');

contract('PartnerInherited1, PartnerInherited2', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  let InstancePartner1, InstancePartner2, InstancePartner3;
  let result, result1, result2, result3;
  let tx, tx1, tx2, tx3;

  it('Should deploy and transfer contracts', async() => {
    InstancePartner1 = await PartnerInherited1.new(1, 7);
    InstancePartner2 = await PartnerInherited2.new(2);
    InstancePartner3 = await PartnerInherited2.new(2);
    await InstancePartner1.transferOwnership(user1);
    await InstancePartner2.transferOwnership(user2);
    await InstancePartner3.transferOwnership(user3);
  });

  it('user2 should request partnership to PartnerInherited1, user1 should authorize and they should be symetrical partners.', async() => {
    await InstancePartner2.requestPartnership(InstancePartner1.address, { from: user2 });
    result1 = await InstancePartner2.isPartner({ from: InstancePartner1.address});
    assert(result1);
    await InstancePartner1.authorizePartner(InstancePartner2.address, { from: user1 });
    result2 = InstancePartner1.isPartner({ from: InstancePartner2.address});
    assert(result2);
  });

  it('PartnerInherited1 should have own variable set in constructor', async() => {
    result = await InstancePartner1.variableFromConstructor();
    assert.equal(result.toNumber(), 7);
  });

  it('PartnerInherited1 should have own variable', async() => {
    result = await InstancePartner1.randomFunction(1);
    assert.equal(result.toNumber(), 123456790);
  });

  it('PartnerInherited1 should have own function', async() => {
    result = await InstancePartner1.randomFunction(1);
    assert.equal(result.toNumber(), 123456790);
  });

  it('PartnerInherited2 should be able to call a function in PartnerInherited1 with onlyPartner modifier', async() => {
    result = await InstancePartner1.r2pGetTest({ from: InstancePartner2.address });
    assert.equal(result.toString(), 'Hey, this is a string only for my partners!');
  });

  it('user2 should be able to call a function in PartnerInherited2 that calls a function with onlyPartner modifier in PartnerInherited1', async() => {
    result = await InstancePartner2.a2pGetTest(InstancePartner1.address, { from: user2 });
    assert.equal(result.toString(), 'Hey, this is a string only for my partners!');
  });

  it('Partner3 should be not be able to call a function in PartnerInheritance1 with onlyPartner modifier', async() => {
    await truffleAssert.fails(
      InstancePartner1.r2pGetTest({ from: InstancePartner3.address })
    );
  });

  it('user3 should be not be able to call a function in Partner3 that calls a function in PartnerInheritance1 with onlyPartner modifier', async() => {
    await truffleAssert.fails(
      InstancePartner3.a2pGetTest(InstancePartner1.address, { from: user3 })
    );
  });

});
