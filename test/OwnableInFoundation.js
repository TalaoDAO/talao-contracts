const truffleAssert = require('truffle-assertions');
const Foundation = artifacts.require('Foundation');
const OwnableInFoundation = artifacts.require('OwnableInFoundation');

contract('OwnableInFoundation', async (accounts) => {
  const defaultOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const factory = accounts[8];
  const someone = accounts[9];
  let ownableInFoundation;
  let result;

  it('Should deploy Foundation contract', async() => {
    foundation = await Foundation.new();
    assert(foundation);
  });

  it('Should register a Factory contract', async() => {
    // It's only a simulation of a factory contract, otherwise I would have to create one just for this test.
    result = await foundation.addFactory(factory);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('Factory should deploy a OwnableInFoundation contract', async() => {
    ownableInFoundation = await OwnableInFoundation.new(foundation.address, {from: factory});
    assert(ownableInFoundation);
  });

  it('Factory should set User1 as initial owner of OwnableInFoundation contract in Foundation', async() => {
    result = await foundation.setInitialOwnerInFoundation(ownableInFoundation.address, user1, {from: factory});
    assert(result);
  })

  it('Foundation should show link from User1 account to OwnableInFoundation contract', async() => {
    result = await foundation.accountsToContracts(user1, {from: someone});
    assert.equal(result.toString(), ownableInFoundation.address)
  });

  it('Foundation should show link from OwnableInFoundation contract to User1', async() => {
    result = await foundation.contractsToAccounts(ownableInFoundation.address, {from: someone});
    assert.equal(result.toString(), user1);
  });

  it('User1 should have true for isOwnerInFoundation, User2 should have false', async() => {
    result = await ownableInFoundation.isOwnerInFoundation({from: user1});
    assert(result);
    result = await ownableInFoundation.isOwnerInFoundation({from: user2});
    assert(!result);
  });

  it('User1 should transfer isOwnerInFoundation to User2, through Foundation', async() => {
    result = await foundation.transferOwnershipInFoundation(ownableInFoundation.address, user2, {from: user1});
    assert(result);
  });

  it('User1 should have false for isOwnerInFoundation, User2 should have true', async() => {
    result = await ownableInFoundation.isOwnerInFoundation({from: user1});
    assert(!result);
    result = await ownableInFoundation.isOwnerInFoundation({from: user2});
    assert(result);
  });

});
