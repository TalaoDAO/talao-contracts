const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Documents = artifacts.require('DocumentsTest');

// Contract instances.
let token, foundation, documents1;

// Sample data.
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const otherBytes32 = '0x8468697320737472696e67206a7573742066696c6c7320612062797465733332';
const issuedDocType = 1; const docType = 2; const otherDocType = 3;
const docTypeVersion = 1; const otherDocTypeVersion = 2;
const fileChecksum = bytes32; const otherFileChecksum = otherBytes32;
const fileLocationEngine = 1; const otherFileLocationEngine = 2;
const fileLocationHash = bytes32; const otherFileLocationHash = otherBytes32;
const encrypted = true; const otherEncrypted = false;

contract('Documents', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const user6 = accounts[6];
  const factory = accounts[8];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Documents.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Documents.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // 2. Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(defaultUser, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    await token.createVaultAccess(50, { from: user3 });
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  // Simple init for initial owners, already tested in OwnableInFoundation.js
  it('Factory should deploy Documents1 (category 1001 Freelance), Documents2 (category 2001 Marketplace), set initial owners to User1 and User2 and give them ERC 725 Management key', async() => {
    // Documents1
    documents1 = await Documents.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    assert(documents1);
    await foundation.setInitialOwnerInFoundation(documents1.address, user1, {from: factory});
    await documents1.addKey(web3.utils.keccak256(user1), 1, 1, {from: factory});
    // Documents2.
    documents2 = await Documents.new(
      foundation.address,
      token.address,
      2001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    assert(documents2);
    await foundation.setInitialOwnerInFoundation(documents2.address, user2, {from: factory});
    await documents2.addKey(web3.utils.keccak256(user2), 1, 1, {from: factory});
  });

  it('User1 should add a document ID = 1, index[0]', async() => {
    const result = await documents1.createDocument(
      docType,
      docTypeVersion,
      fileChecksum,
      fileLocationEngine,
      fileLocationHash,
      encrypted,
      {from: user1}
    );
    assert(result);
  });

  it('In Document1, User1 be able get documents1 index, but not someone else', async() => {
    const result1 = await documents1.getDocuments({from: user1});
    assert.equal(result1.toString(), 1);
    const result2 = await truffleAssert.fails(
      documents1.getDocuments({ from: someone })
    );
    assert(!result2);
  });

  it('In Document1, User1 be able get document of ID 1, but not someone else', async() => {
    const result1 = await documents1.getDocument(1, {from: user1});
    assert.equal(
      result1.toString(),
      [
        docType,
        docTypeVersion,
        user1,
        fileChecksum,
        fileLocationEngine,
        fileLocationHash,
        encrypted
      ]
    );
    const result2 = await truffleAssert.fails(
      documents1.getDocument(1, { from: someone })
    );
    assert(!result2);
  });

  it('User1 should add a new document ID = 2, index[1]', async() => {
    const result = await documents1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    );
    assert(result);
  });

  it('User1 should add a new document ID = 3, index[2]', async() => {
    const result = await documents1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    );
    assert(result);
  });

  it('User1 should add a new document ID = 4, index[3]', async() => {
    const result = await documents1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    );
    assert(result);
  });

  it('User1 should delete document of ID = 2', async() => {
    const result = await documents1.deleteDocument(2, {from: user1});
    assert(result);
    truffleAssert.eventEmitted(result, 'DocumentRemoved');
  });

  it('getDocuments should return the correct array of doc IDs [1, 4, 3]', async() => {
    const result = await documents1.getDocuments({from: user1});
    assert.equal(
      result.toString(),
      '1,4,3'
    );
  });

  it('User1 should "update" the doc ID = 1, index[0]. In fact this will delete the doc and add a new doc.', async() => {
    const result = await documents1.updateDocument(
      1,
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    );
    assert(result);
    truffleAssert.eventEmitted(result, 'DocumentAdded');
    truffleAssert.eventEmitted(result, 'DocumentRemoved');
  });

  it('getDocuments should return the correct array of doc IDs [3, 4, 5]', async() => {
    const result = await documents1.getDocuments({from: user1});
    assert.equal(
      result.toString(),
      '3,4,5'
    );
  });

  it('User1 gives key to User6 for profile & documents1 (ERC 725 20002)', async() => {
    const user6key = web3.utils.keccak256(user6);
    const result = await documents1.addKey(user6key, 20002, 1, {from: user1});
    assert(result);
  });

  it('User6 should add a new document', async() => {
    const result = await documents1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user6}
    );
    assert(result);
  });

});
