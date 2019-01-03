const web3 = require('web3');
const truffleAssert = require('truffle-assertions');
const erc735js = require('erc735js');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('KeyHolderLibrary');
const KeyHolder = artifacts.require('KeyHolder');

// Contract instances.
let keyHolder;

// Tests.
contract('KeyHolder', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await KeyHolder.link(KeyHolderLibrary, keyHolderLibrary.address);
  });

  it('Deploy and init contract', async() => {
    keyHolder = await KeyHolder.new({from: user1}
    );
    assert(keyHolder);
  });

  it('User1 should have any ERC 725 key purpose', async() => {
    const result1 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user1), 1);
    assert(result1);
    const result2 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user1), 123);
    assert(result2);
    const result3 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user1), 456);
    assert(result3);
  });

  it('User2 should not have any ERC 725 key purpose', async() => {
    const result1 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user2), 1);
    assert(!result1);
    const result2 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user2), 123);
    assert(!result2);
    const result3 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user2), 456);
    assert(!result3);
  });

  it('User1 should add ERC 725 key with purpose 123 for User2', async() => {
    const result = await keyHolder.addKey(web3.utils.keccak256(user2), 123, 1, {from: user1});
    assert(result);
  });

  it('User2 should only have purpose 123', async() => {
    const result1 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user2), 1);
    assert(!result1);
    const result2 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user2), 123);
    assert(result2);
    const result3 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user2), 456);
    assert(!result3);
  });

  it('User3 should not have any ERC 725 key purpose', async() => {
    const result1 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 1);
    assert(!result1);
    const result2 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 123);
    assert(!result2);
    const result3 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 456);
    assert(!result3);
  });

  it('User1 should add ERC 725 key with purpose 456 for User3', async() => {
    const result = await keyHolder.addKey(web3.utils.keccak256(user3), 456, 1, {from: user1});
    assert(result);
  });

  it('User3 should only have purpose 456', async() => {
    const result1 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 1);
    assert(!result1);
    const result2 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 123);
    assert(!result2);
    const result3 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 456);
    assert(result3);
  });

  it('User1 should add purpose 123 to User3\'s ERC 725 key', async() => {
    const result = await keyHolder.addPurpose(web3.utils.keccak256(user3), 123, {from: user1});
    assert(result);
  });

  it('User3 should have purpose 123 and 456', async() => {
    const result1 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 1);
    assert(!result1);
    const result2 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 123);
    assert(result2);
    const result3 = await keyHolder.keyHasPurpose(web3.utils.keccak256(user3), 456);
    assert(result3);
  });

});
