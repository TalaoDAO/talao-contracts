const truffleAssert = require('truffle-assertions');
const Partner = artifacts.require('Partner');
const PartnerInheritance = artifacts.require('PartnerInheritance');

contract('PartnerInheritance', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  let InstancePartner1, InstancePartnerInheritance2, InstancePartner3;
  let result, result1, result2, result3;
  let tx, tx1, tx2, tx3;

  it('Should deploy and transfer contracts', async() => {
    InstancePartner1 = await Partner.new(1);
    InstancePartnerInheritance2 = await PartnerInheritance.new(2, 7);
    InstancePartner3 = await Partner.new(3);
    await InstancePartner1.transferOwnership(user1);
    await InstancePartnerInheritance2.transferOwnership(user2);
    result2 = await InstancePartnerInheritance2.owner();
    assert.equal(result2, user2);
    await InstancePartner3.transferOwnership(user3);
  });

  it('Partner1 should request partnership to Partner2, Partner2 should authorize and they should be symetrical partners.', async() => {
    await InstancePartner1.requestPartnership(InstancePartnerInheritance2.address, { from: user1 });
    result1 = await InstancePartner1.isPartner({ from: InstancePartnerInheritance2.address});
    assert(result1);
    await InstancePartnerInheritance2.authorizePartner(InstancePartner1.address, { from: user2 });
    result2 = InstancePartnerInheritance2.isPartner({ from: InstancePartner1.address});
    assert(result2);
  });

  it('PartnerInheritance2 should have own variable set in constructor', async() => {
    result = await InstancePartnerInheritance2.variableFromConstructor();
    assert.equal(result.toNumber(), 7);
  });

  it('PartnerInheritance2 should have own variable', async() => {
    result = await InstancePartnerInheritance2.randomFunction(1);
    assert.equal(result.toNumber(), 123456790);
  });

  it('PartnerInheritance2 should have own function', async() => {
    result = await InstancePartnerInheritance2.randomFunction(1);
    assert.equal(result.toNumber(), 123456790);
  });

  it('Partner1 should be able to call a function with onlyPartner modifier in PartnerInheritance2', async() => {
    result = await InstancePartnerInheritance2.getOnlyPartnerTest({ from: InstancePartner1.address });
    assert.equal(result.toString(), 'Hey, this is a string only for my partners!');
  });

  it('Partner3 should be not be able to call a function with onlyPartner modifier in PartnerInheritance2', async() => {
    await truffleAssert.fails(
      InstancePartnerInheritance2.getOnlyPartnerTest({ from: InstancePartner3.address })
    );
  });

});
