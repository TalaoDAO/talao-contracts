const truffleAssert = require('truffle-assertions');
const Foundation = artifacts.require('Foundation');
const Filebox = artifacts.require('FileboxTest');

// "this string just fills a bytes32"
const fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const publicEncryptionKey = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const fileEngine = 1;
const encryptionAlgorithm = 1;

contract('Filebox', async (accounts) => {
  const defaultOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const factory = accounts[9];
  let foundation;
  let filebox;
  let result;
  let event;

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

  it('Should create a Filebox contract and assign it to User1', async() => {
    filebox = await Filebox.new(foundation.address, {from: factory});
    await foundation.setInitialOwnerInFoundation(filebox.address, user1, {from: factory});
  });

  it('User1 should set his filebox', async() => {
    result = await filebox.setFilebox(
      publicEncryptionKey,
      encryptionAlgorithm,
      {from: user1}
    );
    assert(result);
  });

  it('User2 should be able to get filebox public encryption key and encryption algorithm', async() => {
    result = await filebox.fileboxSettings({from: user2});
    assert.equal(
      result.toString(),
      [
        publicEncryptionKey,
        encryptionAlgorithm
      ]
    );
  });

  it('User2 should be able to notify an encrypted decentralized file in filebox', async() => {
    result = await filebox.sendFilebox(
      fileHash,
      fileEngine,
      {from: user2}
    );
    truffleAssert.eventEmitted(result, 'FileboxReceived', event => {
      return (
        event.sender === user2
      );
    });
    event = result.logs[0].args;
    assert.equal(event.sender, user2);
    assert.equal(event.fileHash, fileHash);
    assert.equal(event.fileEngine, fileEngine);
  });

  it('User1 should blacklist user2', async() => {
    result = filebox.blacklistAddressInFilebox(user2, {from: user1});
    assert(result);
  });

  it('User2 should not be able to "send a file" to filebox any more', async() => {
    result = await truffleAssert.fails(
      filebox.sendFilebox(
        fileHash,
        fileEngine,
        {from: user2}
      )
    );
    assert(!result);
  });

  it('User1 should unblacklist user2', async() => {
    result = await filebox.unblacklistAddressInFilebox(user2, {from: user1});
    assert(result);
    result = await filebox.fileboxBlacklist(user2, {from: user2});
    assert(!result);
  });

  it('User2 should be able to notify an encrypted decentralized file in filebox', async() => {
    result = await filebox.sendFilebox(
      fileHash,
      fileEngine,
      {from: user2}
    );
    truffleAssert.eventEmitted(result, 'FileboxReceived', event => {
      return (
        event.sender === user2
      );
    });
    event = result.logs[0].args;
    assert.equal(event.sender, user2);
    assert.equal(event.fileHash, fileHash);
    assert.equal(event.fileEngine, fileEngine);
  });

});
