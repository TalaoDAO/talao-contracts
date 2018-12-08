const Partner = artifacts.require('Partner');
const PartnerInheritance = artifacts.require('PartnerInheritance');

contract('Partner inheritance', async (accounts) => {
  const userRoot = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  let InstancePartner1, InstancePartnerInheritance2;

  it('Should deploy Partner1 and PartnerInheritance2 contracts', async() => {
    InstancePartner1 = await Partner.new(1);
    InstancePartnerInheritance2 = await PartnerInheritance.new(2, 7);
  });

  it('Should transfer them to user1 and user2', async() => {
    await InstancePartner1.transferOwnership(user1);
    const ownerInstancePartner1 = await InstancePartner1.owner();
    await InstancePartnerInheritance2.transferOwnership(user2);
    const ownerInstancePartnerInheritance2 = await InstancePartnerInheritance2.owner();
    assert.equal(ownerInstancePartner1, user1);
    assert.equal(ownerInstancePartnerInheritance2, user2);
  });

  it('PartnerInheritance2 should have own variable set in constructor', async() => {
    const variableFromConstructor = await InstancePartnerInheritance2.variableFromConstructor();
    assert.equal(variableFromConstructor.toNumber(), 7);
  });

  it('PartnerInheritance2 should have own variable', async() => {
    const randomFunctionResult = await InstancePartnerInheritance2.randomFunction(1);
    assert.equal(randomFunctionResult.toNumber(), 123456790);
  });

  it('PartnerInheritance2 should have own function', async() => {
    const randomFunctionResult = await InstancePartnerInheritance2.randomFunction(1);
    assert.equal(randomFunctionResult.toNumber(), 123456790);
  });

  it('Partner1 should request partnership to Partner2', async() => {
    await InstancePartner1.requestPartnership(InstancePartnerInheritance2.address, { from: user1 });
  });

  it('PartnerInheritance2 should have been added as partner in Partner1.', async() => {
    const addedAsPartner = await InstancePartner1.isPartner({ from: InstancePartnerInheritance2.address});
    assert(addedAsPartner);
  });

});
