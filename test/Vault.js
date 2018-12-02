import EVMThrow from './helpers/EVMThrow';
import revert from './helpers/revert';
import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';
const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

const Talao = artifacts.require('TalaoToken');
const VaultFactory = artifacts.require('VaultFactory');
const Vault = artifacts.require('Vault');
const ImportVault = artifacts.require('ImportVault');

// "this is 16 bytes"
const bytes16 = '0x74686973206973203136206279746573';
const otherBytes16 = '0x74686973206973203136206279746574';
// "this is exactly 24 bytes"
const bytes24 = '0x746869732069732065786163746c79203234206279746573';
const otherBytes24 = '0x746869732069732065786163746c79203234206279746574';
// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const otherBytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733333';
// "this string is exactly bytes30"
const bytes30 = '0x7468697320737472696e672069732065786163746c792062797465733330';
const otherBytes30 = '0x7468697320737472696e672069732065786163746c792062797465733331';
// Small string.
const smallString = 'This is really a rather small string which barely makes 1 line.';
const otherSmallString = 'This is another rather small string which barely makes 1 line.';
// Big string.
const bigString = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const otherBigString = 'Donec a pulvinar augue, nec dapibus lacus. Pellentesque vitae dui facilisis, viverra massa quis, blandit eros. Duis tincidunt, purus ac fermentum pharetra, felis tellus mollis arcu, pretium pulvinar nunc est quis dui. Fusce mollis placerat massa, vitae laoreet lacus porta eu. Praesent eros velit, egestas aliquam rhoncus in, suscipit mollis sapien. Sed velit purus, euismod ut metus quis, blandit venenatis justo. Aenean a tellus a libero varius fringilla. Aliquam sed ligula laoreet justo consequat faucibus id nec ex. Nullam et nisl id purus mattis tempus eu eu dui. Quisque efficitur, ligula quis placerat elementum, leo urna laoreet mi, et viverra metus enim faucibus libero. Integer urna elit, laoreet nec tristique eu, tincidunt nec quam. Quisque vel ligula sit amet ex fermentum scelerisque vel id diam. Donec accumsan quis nulla sit amet semper.';

let gasUsed;

contract('VaultFactory', async (accounts) => {

  beforeEach( () => {
    gasUsed = 0;
  });

  const tryCatch = require('./exceptions.js').tryCatch;
  const errTypes = require('./exceptions.js').errTypes;

  let TalaoInstance,
      VaultFactoryInstance,
      VaultInstance,
      VaultInstance2,
      ImportVaultInstance;

  let vaultAddress, vaultAddress2;

  /**
   * Accounts
   */

  // Contracts owner (except Vault contracts that are transfered to Freelancers).
  const owner = accounts[0];
  // Freelancer n°1.
  const freelancer = accounts[1];
  // Talao certificates bot, he can get all Vault adresses, but not contents.
  const bot = accounts[2];
  // Partner of a Freelancer.
  const partner = accounts[3];
  // Anonymous user.
  const someone = accounts[4];
  // Freelancer n°2.
  const freelancer2 = accounts[5];

  /**
   * Talao token.
   * NOT TO BE TESTED. It's only there to initialize following tests.
   */
  it('Should create the TalaoToken', async () => {
    TalaoInstance = await Talao.deployed();
    gasUsed = '';
    assert(TalaoInstance);
  });
  it('Should mint', async () => {
    const isMinted = await TalaoInstance.mint(owner, 150000000000000000000);
    gasUsed = isMinted.receipt.gasUsed;
    assert(isMinted);
  });
  it('Should stop minting', async () => {
    const hasMintedStopped = await TalaoInstance.finishMinting();
    gasUsed = hasMintedStopped.receipt.gasUsed;
    assert(hasMintedStopped);
  });
  it('Should set vault deposit', async () => {
    const setVaultDepositTx = await TalaoInstance.setVaultDeposit(10);
    gasUsed = setVaultDepositTx.receipt.gasUsed;
  });
  it('Should get balance of Talao', async () => {
    gasUsed = '';
    const ownerBalance = await TalaoInstance.balanceOf(owner);
    assert.equal(ownerBalance.c, 1500000);
  });

  /**
   * In the token, create Vault access with a price of 5 TALAO for the Freelancer.
   * NOT TO BE TESTED. It's only there to initialize following tests.
   */
  it('Should transfer TALAOs to Freelance', async () => {
    const isTransferDone = await TalaoInstance.transfer(
      freelancer,
      20,
      { from: owner }
    );
    gasUsed = isTransferDone.receipt.gasUsed;
    assert(isTransferDone);
  });
  it('Should get balance of Freelance', async () => {
    const freelancerBalance = await TalaoInstance.balanceOf(freelancer);
    gasUsed = '';
    assert.equal(freelancerBalance.c, 20);
  });
  it('Should get Vault deposit', async () => {
    const vaultDeposit = await TalaoInstance.vaultDeposit.call();
    gasUsed = '';
    assert.equal(vaultDeposit.c, 10);
  });
  it('Should create Vault access', async () => {
    const createVaultAccess = await TalaoInstance.createVaultAccess(5, { from: freelancer });
    gasUsed = createVaultAccess.receipt.gasUsed;
    const hasVaultAccess = await TalaoInstance.hasVaultAccess(freelancer, freelancer, { from: someone });
    assert(hasVaultAccess);
  });
  it('Vault price should be set.', async () => {
    const freelancerData = await TalaoInstance.data(freelancer);
    const freelancerVaultPrice = freelancerData[0].toNumber();
    gasUsed = '';
    assert.equal(freelancerVaultPrice, 5);
  });

  /**
   * Create VaultFactory smart contract.
   */
  it('Should create the VaultFactory smart contract', async () => {
    VaultFactoryInstance = await VaultFactory.new(
      TalaoInstance.address,
      { from: owner }
    );
    gasUsed = '';
    assert(VaultFactoryInstance);
  });

  /**
   * Create Freelancer's Vault
   */
  it('Freelancer should be able to create a Vault', async () => {
    let VaultReceipt = await VaultFactoryInstance.createVaultContract(
      bytes16,
      bytes16,
      bytes16,
      bytes16,
      bytes32,
      bytes32,
      1,
      bytes30,
      bigString,
      { from: freelancer }
    );
    vaultAddress = VaultReceipt.logs[0].address;
    gasUsed = VaultReceipt.receipt.gasUsed;
  });
  it('Freelancer should have a Vault now', async () => {
    const hasVault = await VaultFactoryInstance.hasActiveVault.call(
      freelancer,
      { from: someone }
    );
    gasUsed = '';
    assert(hasVault);
  });
  it('There should be 1 Vault in total now', async () => {
    const vaultsNumber = await VaultFactoryInstance.activeVaultsNumber.call({ from: someone });
    gasUsed = '';
    assert.equal(vaultsNumber, 1);
  });

  /**
   * Talao bot.
   */
  it('Should not allow non set bot to get the Vault address', async () => {
    const vaultAddressNull = await VaultFactoryInstance.getVault.call(
      freelancer,
      { from: bot }
    );
    gasUsed = '';
    assert.equal(vaultAddressNull, '0x0000000000000000000000000000000000000000');
  });
  it('Should set the bot address', async () => {
    const setTalaoBotTx = await VaultFactoryInstance.setTalaoBot(bot, { from: owner });
    const isTalaoBot = await VaultFactoryInstance.isTalaoBot.call(
      bot,
      { from: someone }
    );
    gasUsed = setTalaoBotTx.receipt.gasUsed;
    assert.equal(isTalaoBot, true);
  });
  it('Should allow bot to get the Vault address', async () => {
    const botGetVaultAddress = await VaultFactoryInstance.getVault(
      freelancer,
      { from: bot }
    );
    gasUsed = '';
    assert.equal(botGetVaultAddress, vaultAddress);
  });

  /**
   * Vault.
   */
  it('Freelancer profile should be set', async () => {
    if (VaultInstance == null) {
      VaultInstance = Vault.at(vaultAddress);
    }
    const freelancerProfile = await VaultInstance.getProfile(
      { from: someone }
    );
    gasUsed = '';
    assert.equal(freelancerProfile[0], bytes16);
    assert.equal(freelancerProfile[1], bytes16);
    assert.equal(freelancerProfile[2], bytes16);
    assert.equal(freelancerProfile[3], bytes16);
    assert.equal(freelancerProfile[4], bytes32);
    assert.equal(freelancerProfile[5], bytes32);
    assert.equal(freelancerProfile[6], 1);
    assert.equal(freelancerProfile[7], bytes30);
    assert.equal(freelancerProfile[8], bigString);
  });
  it('Should add document to Vault', async () => {
    if (VaultInstance == null) {
      VaultInstance = Vault.at(vaultAddress);
    }
    const doc1tx = await VaultInstance.createDocument(
      bytes32,
      1,
      1,
      1,
      false,
      bytes24,
      { from: freelancer }
    );
    const doc1id = doc1tx.logs[0].args.id.toNumber();
    gasUsed = doc1tx.receipt.gasUsed;
    assert.equal(doc1id, 1);
  });
  it('Should get the document', async () => {
    const doc1 = await VaultInstance.getDocument.call(1, { from: freelancer });
    gasUsed = '';
    assert.equal(doc1[0], bytes32);
    assert.equal(doc1[1], 1);
    assert.equal(doc1[2], 1);
    assert.equal(doc1[3], 1);
    assert(!doc1[4]);
    assert.equal(doc1[5], bytes24);
  });
  it('Should add a 2nd document to Vault', async () => {
    if (VaultInstance == null) {
      VaultInstance = Vault.at(vaultAddress);
    }
    const doc2tx = await VaultInstance.createDocument(
      bytes32,
      1,
      1,
      1,
      false,
      bytes24,
      { from: freelancer }
    );
    const doc2id = doc2tx.logs[0].args.id.toNumber();
    gasUsed = doc2tx.receipt.gasUsed;
    assert.equal(doc2id, 2);
  });
  it('Freelance should be able to update the document', async () => {
    const doc2UpdateReceipt = await VaultInstance.updateDocument(
      2,
      otherBytes32,
      2,
      2,
      2,
      otherBytes24,
      { from: freelancer }
    );
    gasUsed = doc2UpdateReceipt.receipt.gasUsed;
    assert(doc2UpdateReceipt);
  });
  it('Document should have been updated', async () => {
    const doc2Updated = await VaultInstance.getDocument.call(2, { from: freelancer });
    gasUsed = '';
    assert.equal(doc2Updated[0], otherBytes32);
    assert.equal(doc2Updated[1].toNumber(), 2);
    assert.equal(doc2Updated[2].toNumber(), 2);
    assert.equal(doc2Updated[3].toNumber(), 2);
    assert(!doc2Updated[4]);
    assert.equal(doc2Updated[5], otherBytes24);
  });
  it('Should be able to get the documents index', async () => {
    const index = await VaultInstance.getDocuments.call({ from: freelancer });
    gasUsed = '';
    assert.equal(index[0].toNumber(), 1);
    assert.equal(index[1].toNumber(), 2);
  });
  it('Freelancer should be able to delete a document', async () => {
    // First create a 3rd document, to verify the index later.
    await VaultInstance.createDocument(
      bytes32,
      1,
      1,
      1,
      false,
      bytes24,
      { from: freelancer }
    );
    // Now delete the 2nd document.
    const doc2DeletedReceipt = await VaultInstance.deleteDocument(2, { from: freelancer });
    gasUsed = doc2DeletedReceipt.receipt.gasUsed;
    assert(doc2DeletedReceipt);
  });
  it('Index should have been updated with document 2 removed', async () => {
    const newIndex = await VaultInstance.getDocuments.call({ from: freelancer });
    gasUsed = '';
    assert.equal(newIndex[0].toNumber(), 1);
    assert.equal(newIndex[1].toNumber(), 3);
  });

  /**
   * Partner
   */
  it('Should refuse Partner because it was not set yet', async () => {
    const isPartner = await VaultInstance.Partners.call(
      partner,
      { from: someone }
    );
    gasUsed = '';
    assert(!isPartner);
  });
  it('Should set a Partner', async () => {
    const setPartner = await VaultInstance.setPartner(
      partner,
      true,
      { from: freelancer }
    );
    gasUsed = setPartner.receipt.gasUsed;
    assert(setPartner);
  });
  it('Partner should be allowed now', async () => {
    const isPartner2 = await VaultInstance.Partners.call(
      partner,
      { from: someone }
    );
    gasUsed = '';
    assert(isPartner2);
  });
  it('Partner should be able to get the index and the first doc', async () => {
    const doc1index = await VaultInstance.getDocuments.call({ from: partner })
    const doc1indexdoc = await VaultInstance.getDocument.call(
      doc1index[0],
      { from: partner }
    );
    gasUsed = '';
    assert.equal(doc1indexdoc[0], bytes32);
    assert.equal(doc1indexdoc[1], 1);
    assert.equal(doc1indexdoc[2], 1);
    assert.equal(doc1indexdoc[3], 1);
    assert(!doc1indexdoc[4]);
    assert.equal(doc1indexdoc[5], bytes24);
  });

  /**
   * Vaults with access price = 0 should be accessible to anyone.
   */
  it('Give TALAOs to Freelance 2', async () => {
    const talaoTransfer2 = await TalaoInstance.transfer(
      freelancer2,
      20,
      { from: owner }
    );
    gasUsed = talaoTransfer2.receipt.gasUsed;
    assert(talaoTransfer2);
  });
  it('Freelancer 2 should be able to set his Vault price to 0', async () => {
    const createVaultAccess2 = await TalaoInstance.createVaultAccess(
      0,
      { from: freelancer2 }
    );
    gasUsed = createVaultAccess2.receipt.gasUsed;
  });
  it('Freelancer2 should be able to create a Vault', async () => {
    let VaultReceipt2 = await VaultFactoryInstance.createVaultContract(
      bytes16,
      bytes16,
      bytes16,
      bytes16,
      bytes32,
      bytes32,
      1,
      bytes30,
      bigString,
      { from: freelancer2 }
    );
    vaultAddress2 = VaultReceipt2.logs[0].address;
    gasUsed = VaultReceipt2.receipt.gasUsed;
  });
  it('Should add document to Vault', async () => {
    if (VaultInstance2 == null) {
      VaultInstance2 = Vault.at(vaultAddress2);
    }
    const f2doc1tx = await VaultInstance2.createDocument(
      bytes32,
      1,
      1,
      1,
      false,
      bytes24,
      { from: freelancer2 }
    );
    const f2doc1id = f2doc1tx.logs[0].args.id.toNumber();
    gasUsed = f2doc1tx.receipt.gasUsed;
    assert.equal(f2doc1id, 1);
  });
  it('Anyone should be able to get the document', async () => {
    const getDoc1Freelance2 = await VaultInstance2.getDocument.call(1, { from: someone });
    gasUsed = '';
    assert.equal(getDoc1Freelance2[0], bytes32);
    assert.equal(getDoc1Freelance2[1].toNumber(), 1);
    assert.equal(getDoc1Freelance2[2].toNumber(), 1);
    assert.equal(getDoc1Freelance2[3].toNumber(), 1);
    assert(!getDoc1Freelance2[4]);
    assert.equal(getDoc1Freelance2[5], bytes24);
  });

  /**
   * Import Vault
   */
  it('Should create the ImportVault contract', async () => {
    ImportVaultInstance = await ImportVault.new(VaultInstance.address)
    assert(ImportVaultInstance);
  });
  it('Should list a Partner in order to import docs', async () => {
    const setPartner = await VaultInstance.setPartner(
      ImportVaultInstance.address,
      true,
      { from: freelancer }
    );
    gasUsed = setPartner.receipt.gasUsed;
    assert(setPartner);
  });
  it('Should import a document into a new Vault', async () => {
    const indexOfDocsToImport = await VaultInstance.getDocuments.call({ from: partner });
    const importDocumentTx = await ImportVaultInstance.importDocument(
      1,
      0,
      indexOfDocsToImport[0].toNumber(),
      { from: partner }
    );
    gasUsed = importDocumentTx.receipt.gasUsed;
    const originalDoc = await VaultInstance.getDocument.call(
      indexOfDocsToImport[0],
      {from: partner}
    );
    const newDoc = await ImportVaultInstance.getImportedDocument.call(
      1,
      { from: partner }
    );
    assert.equal(originalDoc.toString(), newDoc.toString());
  });

  afterEach( () => {
    if (gasUsed != '') {
      console.log('Gas used: ' + gasUsed);
    }
  });

});
