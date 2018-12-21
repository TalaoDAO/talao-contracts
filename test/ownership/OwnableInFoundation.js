const truffleAssert = require('truffle-assertions');
const Foundation = artifacts.require('Foundation');
const OwnableInFoundation = artifacts.require('OwnableInFoundation');
const OwnableInFoundationTest = artifacts.require('OwnableInFoundationTest');

contract('OwnableInFoundation', async (accounts) => {
  const defaultOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const factory = accounts[8];
  const someone = accounts[9];
  let ownableInFoundation, ownableInFoundationTest;

  it('Should deploy Foundation contract', async() => {
    foundation = await Foundation.new();
    assert(foundation);
  });

  it('Should register a Factory contract', async() => {
    // It's only a simulation of a factory contract, otherwise I would have to create one just for this test.
    const result = await foundation.addFactory(factory);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('Factory should deploy a OwnableInFoundation contract', async() => {
    ownableInFoundation = await OwnableInFoundation.new(foundation.address, {from: factory});
    assert(ownableInFoundation);
  });

  it('Factory should set User1 as initial owner of OwnableInFoundation contract in Foundation', async() => {
    const result = await foundation.setInitialOwnerInFoundation(ownableInFoundation.address, user1, {from: factory});
    assert(result);
  })

  it('Foundation should show link from User1 account to OwnableInFoundation contract', async() => {
    const result = await foundation.ownersToContracts(user1, {from: someone});
    assert.equal(result.toString(), ownableInFoundation.address)
  });

  it('Foundation should show link from OwnableInFoundation contract to User1', async() => {
    const result = await foundation.contractsToOwners(ownableInFoundation.address, {from: someone});
    assert.equal(result.toString(), user1);
  });

  it('User1 should transfer isOwnerInFoundation to User2, through Foundation', async() => {
    const result = await foundation.transferOwnershipInFoundation(ownableInFoundation.address, user2, {from: user1});
    assert(result);
  });

  it('Factory should deploy a OwnableInFoundationTest contract', async() => {
    ownableInFoundationTest = await OwnableInFoundationTest.new(foundation.address, {from: factory});
    assert(ownableInFoundationTest);
  });

  it('Factory should set User1 as initial owner of OwnableInFoundationTest contract in Foundation', async() => {
    const result = await foundation.setInitialOwnerInFoundation(ownableInFoundationTest.address, user1, {from: factory});
    assert(result);
  });

  it('User1 should be able to use a function with onlyOwnerInFoundation modifier', async() => {
    const result = await ownableInFoundationTest.getSecret({from: user1});
    assert.equal(result.toString(), "This is sort of a secret string");
  });

  it('User2 should fail to use this function', async() => {
    const result = await truffleAssert.fails(
      ownableInFoundationTest.getSecret({from: user2})
    );
  });

});
