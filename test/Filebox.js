const truffleAssert = require('truffle-assertions');
const Filebox = artifacts.require('Filebox');

// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const encryptionAlgorithm = 1;
const fileEngine = 1;

contract('Filebox', async (accounts) => {
  const superOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  let filebox;
  let result;
  let event;

  it('Should create a Filebox contract and transfer it to user1', async() => {
    filebox = await Filebox.new();
    await filebox.transferOwnership(user1);
  });

  it('user1 should configure his filebox', async() => {
    result = await filebox.fileboxConfigure(
      bytes32,
      encryptionAlgorithm,
      {from: user1}
    );
    assert(result);
  });

  it('user2 should be able to get filebox public encryption key and encryption algorithm', async() => {
    result = await filebox.fileboxSettings({from: user2});
    assert.equal(
      result.toString(),
      [
        bytes32,
        encryptionAlgorithm
      ]
    );
  });

  it('user2 should be able to notify an encrypted decentralized file in filebox', async() => {
    result = await filebox.fileboxSend(
      bytes32,
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
    assert.equal(event.fileHash, bytes32);
    assert.equal(event.fileEngine, fileEngine);
  });

  it('user1 should blacklist user2', async() => {
    result = filebox.fileboxBlacklist(user2, {from: user1});
    assert(result);
  });

  it('user2 should not be able to "send a file" to filebox any more', async() => {
    result = await truffleAssert.fails(
      filebox.fileboxSend(
        bytes32,
        fileEngine,
        {from: user2}
      )
    );
    assert(!result);
  });

  it('user1 should unblacklist user2', async() => {
    result = await filebox.fileboxUnblacklist(user2, {from: user1});
    assert(result);
    result = await filebox.fileboxBlacklisted(user2, {from: user2});
    assert(!result);
  });

  it('user2 should be able to notify an encrypted decentralized file in filebox', async() => {
    result = await filebox.fileboxSend(
      bytes32,
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
    assert.equal(event.fileHash, bytes32);
    assert.equal(event.fileEngine, fileEngine);
  });

});
