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
  let Tokenized1, Tokenized2, Tokenized3, Tokenized4;
  let result, result1, result2, result3, result4;
  let tx, tx1, tx2, tx3, tx4;

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
  it('Should deploy Tokenized1 (category 1) and Tokenized2 (category 2) and transfer them to user1 and user2', async() => {
    Tokenized1 = await Tokenized.new(1, token.address);
    await Tokenized1.transferOwnership(user1);
    Tokenized2 = await Tokenized.new(2, token.address);
    await Tokenized2.transferOwnership(user2);
  });

  it('user1 should be able to read from Tokenized1', async() => {
    result = await Tokenized1.isReader({from: user1});
    assert(result);
  });

  it('user3 should not be able to read from Tokenized1', async() => {
    result = await Tokenized1.isReader({from: user3});
    assert(!result);
  });

  it('user3 buys Vault access for user1 and then, should be able to read from Tokenized1', async() => {
    await token.getVaultAccess(user1, {from: user3});
    result = await Tokenized1.isReader({from: user3});
    assert(result);
  });

  it('user2 should not be able to read from Tokenized1', async() => {
    result = await Tokenized1.isReader({from: user2});
    assert(!result);
  });

  it('user2 asks partnership with Tokenized1, user1 accepts, and then user2 should not be able to read from Tokenized1', async() => {
    await Tokenized2.requestPartnership(Tokenized1.address, {from: user2});
    await Tokenized1.authorizePartner(Tokenized2.address, {from: user1});
    result = await Tokenized1.isReader({from: user2});
    assert(result);
  });

  it('user1 closes Vault access, and user2 should not be able to read from Tokenized1 anymore', async() => {
    await token.closeVaultAccess({from:user1});
    result = await Tokenized1.isReader({from: user2});
    assert(!result);
  });

  it('Anyone should be able to read from Tokenized2 because access if free and user2 has open Vault', async() => {
    result = await Tokenized2.isReader({from: someone});
    assert(result);
  });

  it('user2 closes Vault access, no one expect user2 should not be able to read from Tokenized2 anymore, even partners', async() => {
    await token.closeVaultAccess({from:user2});
    result1 = await Tokenized2.isReader({from: someone});
    assert(!result1);
    result2 = await Tokenized2.isReader({from: user1});
    assert(!result2);
  });

});
