const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Documents = artifacts.require('DocumentsTest');

// Contract instances.
let token, foundation, documents;

// Sample data.
// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const otherBytes32 = '0x8468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is exactly 24 bytes"
const bytes24 = '0x746869732069732065786163746c79203234206279746573';
const otherBytes24 = '0x846869732069732065786163746c79203234206279746573';
// String.
const string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const otherString = 'Eius populus ab incunabulis primis ad usque pueritiae tempus extremum, quod annis circumcluditur fere trecentis, circummurana pertulit bella, deinde aetatem ingressus adultam post multiplices bellorum aerumnas Alpes transcendit et fretum, in iuvenem erectus et virum ex omni plaga quam orbis ambit inmensus, reportavit laureas et triumphos, iamque vergens in senium et nomine solo aliquotiens vincens ad tranquilliora vitae discessit.';
const fileEngine = 1;
const otherFileEngine = 11;
const docType = 3;
const otherDocType = 13;
const docTypeVersion = 4;
const otherDocTypeVersion = 14;
const encrypted = true;
const otherEncrypted = false;

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
  it('Factory should deploy Documents (category 1001), set initial owner and give him ERC 725 Management key', async() => {
    documents = await Documents.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    assert(documents);
    await foundation.setInitialOwnerInFoundation(documents.address, user1, {from: factory});
    const user1key = web3.utils.keccak256(user1);
    await documents.addKey(user1key, 1, 1, {from: factory});
  });

  it('User1 should add a document ID = 1, index[0]', async() => {
    const result = await documents.createDocument(
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

  it('In Document1, User1 be able get documents index, but not someone else', async() => {
    const result1 = await documents.getDocuments({from: user1});
    assert.equal(result1.toString(), 1);
    const result2 = await truffleAssert.fails(
      documents.getDocuments({ from: someone })
    );
    assert(!result2);
  });

  it('In Document1, User1 be able get document of ID 1, but not someone else', async() => {
    const result1 = await documents.getDocument(1, {from: user1});
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
      documents.getDocument(1, { from: someone })
    );
    assert(!result2);
  });

  it('User1 should add a new document ID = 2, index[1]', async() => {
    const result = await documents.createDocument(
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
    const result = await documents.createDocument(
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
    const result = await documents.createDocument(
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
    const result = await documents.deleteDocument(2, {from: user1});
    assert(result);
    truffleAssert.eventEmitted(result, 'DocumentRemoved');
  });

  it('getDocuments should return the correct array of doc IDs [1, 4, 3]', async() => {
    const result = await documents.getDocuments({from: user1});
    assert.equal(
      result.toString(),
      '1,4,3'
    );
  });

  it('User1 should "update" the doc ID = 1, index[0]. In fact this will delete the doc and add a new doc.', async() => {
    const result = await documents.updateDocument(
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
    const result = await documents.getDocuments({from: user1});
    assert.equal(
      result.toString(),
      '3,4,5'
    );
  });

  it('User1 gives key to User6 for profile & documents (ERC 725 20002)', async() => {
    const user6key = web3.utils.keccak256(user6);
    const result = await documents.addKey(user6key, 20002, 1, {from: user1});
    assert(result);
  });

  it('User6 should add a new document', async() => {
    const result = await documents.createDocument(
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
