const truffleAssert = require('truffle-assertions');
const Foundation = artifacts.require('Foundation');
const TalaoToken = artifacts.require('TalaoToken');
const Tokenized = artifacts.require('Tokenized');

contract('Tokenized', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const factory = accounts[8];
  const someone = accounts[9];
  let foundation;
  let token;
  let tokenized1, tokenized2;
  let result, result1, result2;

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

  // Simple init, already fully tested before the ICO.
  it('Should init token with Vault deposit of 100 TALAO and transfer 1000 TALAO to User1, User2 and User3. User1 should create a Vault access with a price of 10 TALAO and User2 should create a free Vault access', async() => {
    token = await TalaoToken.new();
    await token.mint(talaoOwner, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
  });

  // Simple init, already tested in OwnableInFoundation.js
  it('Factory should deploy Tokenized1 (category 1) and Tokenized2 (category 2) and set initial owners to User1 and User2', async() => {
    tokenized1 = await Tokenized.new(foundation.address, 1, token.address, {from: factory});
    await foundation.setInitialOwnerInFoundation(tokenized1.address, user1, {from: factory});
    tokenized2 = await Tokenized.new(foundation.address, 2, token.address, {from: factory});
    await foundation.setInitialOwnerInFoundation(tokenized2.address, user2, {from: factory});
  });

  it('User1 should be able to read from Tokenized1', async() => {
    result = await tokenized1.isReader({from: user1});
    assert(result);
  });

  it('User3 should not be able to read from Tokenized1', async() => {
    result = await tokenized1.isReader({from: user3});
    assert(!result);
  });

  it('User3 buys Vault access for User1 and then, should be able to read from Tokenized1', async() => {
    await token.getVaultAccess(user1, {from: user3});
    result = await tokenized1.isReader({from: user3});
    assert(result);
  });

  it('User2 should not be able to read from Tokenized1', async() => {
    result = await tokenized1.isReader({from: user2});
    assert(!result);
  });

  it('User2 asks partnership with Tokenized1, User1 accepts, and then User2 should be able to read from Tokenized1', async() => {
    await tokenized2.requestPartnership(tokenized1.address, {from: user2});
    await tokenized1.authorizePartnership(tokenized2.address, {from: user1});
    result = await tokenized1.isReader({from: user2});
    assert(result);
  });

  it('User1 closes Vault access, and User2 should not be able to read from Tokenized1 anymore', async() => {
    await token.closeVaultAccess({from:user1});
    result = await tokenized1.isReader({from: user2});
    assert(!result);
  });

  it('Anyone should be able to read from Tokenized2 because access if free and User2 has open Vault', async() => {
    result = await tokenized2.isReader({from: someone});
    assert(result);
  });

  it('User2 closes Vault access, no one except User2 should be able to read from Tokenized2 anymore, even partners', async() => {
    await token.closeVaultAccess({from:user2});
    result1 = await tokenized2.isReader({from: someone});
    assert(!result1);
    result2 = await tokenized2.isReader({from: user1});
    assert(!result2);
  });

});
