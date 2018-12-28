const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Documents = artifacts.require('DocumentsTest');

// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const otherBytes32 = '0x8468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is exactly 24 bytes"
const bytes24 = '0x746869732069732065786163746c79203234206279746573';
const otherBytes24 = '0x846869732069732065786163746c79203234206279746573';
// String.
const string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const otherString = 'Eius populus ab incunabulis primis ad usque pueritiae tempus extremum, quod annis circumcluditur fere trecentis, circummurana pertulit bella, deinde aetatem ingressus adultam post multiplices bellorum aerumnas Alpes transcendit et fretum, in iuvenem erectus et virum ex omni plaga quam orbis ambit inmensus, reportavit laureas et triumphos, iamque vergens in senium et nomine solo aliquotiens vincens ad tranquilliora vitae discessit.';
// Variables for contracts.
const fileEngine = 1;
const otherFileEngine = 11;
const docType = 3;
const otherDocType = 13;
const docTypeVersion = 4;
const otherDocTypeVersion = 14;
const encrypted = true;
const otherEncrypted = false;

contract('Documents', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const user6 = accounts[6];
  const factory = accounts[8];
  let token;
  let foundation;
  let documents1, documents2, documents3, documents4;

  it('Should deploy keyHolderLibrary, link it in ClaimHolderLibrary, deploy claimHolderLibrary, link both libs in Documents', async() => {
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Documents.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Documents.link(ClaimHolderLibrary, claimHolderLibrary.address);
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

  // Already tested in Foundation.js.
  it('Should deploy Foundation contract and register a Factory contract', async() => {
    foundation = await Foundation.new();
    // It's only a simulation of a factory contract, otherwise I would have to create one just for this test.
    await foundation.addFactory(factory);
  });

  // Simple init for initial owners, already tested in OwnableInFoundation.js
  it('Factory should deploy Documents1 (category 1001) and Documents2 (category 2001) and set initial owners to User1 and User2 and give them ERC 725 Management keys', async() => {
    documents1 = await Documents.new(
      foundation.address,
      token.address,
      1001,
      0,
      0,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(documents1);
    await foundation.setInitialOwnerInFoundation(documents1.address, user1, {from: factory});
    const user1key = web3.utils.keccak256(user1);
    await documents1.addKey(user1key, 1, 1, {from: factory});
    documents2 = await Documents.new(
      foundation.address,
      token.address,
      2001,
      0,
      0,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(documents2);
    await foundation.setInitialOwnerInFoundation(documents2.address, user2, {from: factory});
    const user2key = web3.utils.keccak256(user2);
    await documents2.addKey(user2key, 1, 1, {from: factory});
  });

  it('User1 should add a document ID = 1, index[0]', async() => {
    const result = await documents1.createDocument(
      bytes32,
      fileEngine,
      docType,
      docTypeVersion,
      encrypted,
      bytes24,
      {from: user1}
    );
    assert(result);
  });

  it('In Document1, User1 be able get documents index, but not User2 and User3', async() => {
    const result1 = await documents1.getDocuments({from: user1});
    assert.equal(result1.toString(), 1);
    const result2 = await truffleAssert.fails(
      documents1.getDocuments({ from: user2 })
    );
    assert(!result2);
    const result3 = await truffleAssert.fails(
      documents1.getDocuments({ from: user3 })
    );
    assert(!result3);
  });

  it('In Document1, User1 be able get document of ID 1, but not User2 and User3', async() => {
    const result1 = await documents1.getDocument(1, {from: user1});
    assert.equal(
      result1.toString(),
      [
        bytes32,
        fileEngine,
        docType,
        docTypeVersion,
        encrypted,
        bytes24
      ]
    );
    const result2 = await truffleAssert.fails(
      documents1.getDocument(1, { from: user2 })
    );
    assert(!result2);
    const result3 = await truffleAssert.fails(
      documents1.getDocuments(1, { from: user3 })
    );
    assert(!result3);
  });

  it('User2 requests partnership of his Documents2 contract with Documents1 contract, User1 accepts. User3 buys access to User1 in the token', async() => {
    await documents2.requestPartnership(documents1.address, {from: user2});
    await documents1.authorizePartnership(documents2.address, {from: user1});
    await token.getVaultAccess(user1, {from: user3});
  });

  it('In Document1, User2 and User3 should be able get documents index', async() => {
    const result1 = await documents1.getDocuments({from: user2});
    assert.equal(result1.toString(), 1);
    const result2 = await documents1.getDocuments({from: user3});
    assert.equal(result2.toString(), 1);
  });

  it('In Document1, User2 and User3 should be able get document of ID 1', async() => {
    const result1 = await documents1.getDocument(1, {from: user2});
    assert.equal(
      result1.toString(),
      [
        bytes32,
        fileEngine,
        docType,
        docTypeVersion,
        encrypted,
        bytes24
      ]
    );
    const result2 = await documents1.getDocument(1, {from: user3});
    assert.equal(
      result2.toString(),
      [
        bytes32,
        fileEngine,
        docType,
        docTypeVersion,
        encrypted,
        bytes24
      ]
    );
  });

  it('User1 should add a new document ID = 2, index[1]', async() => {
    const result = await documents1.createDocument(
      otherBytes32,
      otherFileEngine,
      otherDocType,
      otherDocTypeVersion,
      otherEncrypted,
      otherBytes24,
      {from: user1}
    );
    assert(result);
  });

  it('User1 should add a new document ID = 3, index[2]', async() => {
    const result = await documents1.createDocument(
      otherBytes32,
      otherFileEngine,
      otherDocType,
      otherDocTypeVersion,
      otherEncrypted,
      otherBytes24,
      {from: user1}
    );
    assert(result);
  });

  it('User1 should add a new document ID = 4, index[3]', async() => {
    const result = await documents1.createDocument(
      otherBytes32,
      otherFileEngine,
      otherDocType,
      otherDocTypeVersion,
      otherEncrypted,
      otherBytes24,
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
      otherBytes32,
      otherFileEngine,
      otherDocType,
      otherDocTypeVersion,
      otherEncrypted,
      otherBytes24,
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

  it('User1 gives key to User6 for profile & documents (ERC 725 20002)', async() => {
    const user6key = web3.utils.keccak256(user6);
    const result = await documents1.addKey(user6key, 20002, 1, {from: user1});
    assert(result);
  });

  it('User6 should add a new document', async() => {
    const result = await documents1.createDocument(
      otherBytes32,
      otherFileEngine,
      otherDocType,
      otherDocTypeVersion,
      otherEncrypted,
      otherBytes24,
      {from: user6}
    );
    assert(result);
  });

});
