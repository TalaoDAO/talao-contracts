const truffleAssert = require('truffle-assertions');
const TalaoToken = artifacts.require('TalaoToken');
const Tokenized = artifacts.require('Tokenized');

contract('Tokenized', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const someone = accounts[9];
  let token;
  let tokenized1, tokenized2;
  let result, result1, result2;

  // TalaoToken is already fully tested so we'll init here.
  it('Should init token: deploy, mint, finishMinting, setVaultDeposit(100) and transfer 1000 TALAO to user1, user2 and user3. User1 should create a Vault access with a price of 10 TALAO and user2 should create a free Vault access', async() => {
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

  // Ownable is already fully tested so we'll just init here.
  it('Should deploy tokenized1 (category 1) and tokenized2 (category 2) and transfer them to user1 and user2', async() => {
    tokenized1 = await Tokenized.new(1, token.address);
    await tokenized1.transferOwnership(user1);
    tokenized2 = await Tokenized.new(2, token.address);
    await tokenized2.transferOwnership(user2);
  });

  it('user1 should be able to read from tokenized1', async() => {
    result = await tokenized1.isReader({from: user1});
    assert(result);
  });

  it('user3 should not be able to read from tokenized1', async() => {
    result = await tokenized1.isReader({from: user3});
    assert(!result);
  });

  it('user3 buys Vault access for user1 and then, should be able to read from tokenized1', async() => {
    await token.getVaultAccess(user1, {from: user3});
    result = await tokenized1.isReader({from: user3});
    assert(result);
  });

  it('user2 should not be able to read from tokenized1', async() => {
    result = await tokenized1.isReader({from: user2});
    assert(!result);
  });

  it('user2 asks partnership with tokenized1, user1 accepts, and then user2 should not be able to read from tokenized1', async() => {
    await tokenized2.requestPartnership(tokenized1.address, {from: user2});
    await tokenized1.authorizePartnership(tokenized2.address, {from: user1});
    result = await tokenized1.isReader({from: user2});
    assert(result);
  });

  it('user1 closes Vault access, and user2 should not be able to read from tokenized1 anymore', async() => {
    await token.closeVaultAccess({from:user1});
    result = await tokenized1.isReader({from: user2});
    assert(!result);
  });

  it('Anyone should be able to read from tokenized2 because access if free and user2 has open Vault', async() => {
    result = await tokenized2.isReader({from: someone});
    assert(result);
  });

  it('user2 closes Vault access, no one expect user2 should not be able to read from tokenized2 anymore, even partners', async() => {
    await token.closeVaultAccess({from:user2});
    result1 = await tokenized2.isReader({from: someone});
    assert(!result1);
    result2 = await tokenized2.isReader({from: user1});
    assert(!result2);
  });

});
