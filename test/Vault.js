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
const Freelancer = artifacts.require('Freelancer');
const ImportVault = artifacts.require('ImportVault');

contract('VaultFactory', async (accounts) => {
  const tryCatch = require('./exceptions.js').tryCatch;
  const errTypes = require('./exceptions.js').errTypes;

  let TalaoInstance,
      VaultFactoryInstance,
      VaultInstance,
      VaultInstance2,
      FreelancerInstance,
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
    assert(TalaoInstance);
  });
  it('Should mint', async () => {
    const isMinted = await TalaoInstance.mint(owner, 150000000000000000000);
    assert(isMinted);
  });
  it('Should stop minting', async () => {
    const hasMintedStopped = await TalaoInstance.finishMinting();
    assert(hasMintedStopped);
  });
  it('Should set vault deposit', async () => {
    await TalaoInstance.setVaultDeposit(10);
  });
  it('Should get balance of Talao', async () => {
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
    assert(isTransferDone);
  });
  it('Should get balance of Freelance', async () => {
    const freelancerBalance = await TalaoInstance.balanceOf(freelancer);
    assert.equal(freelancerBalance.c, 20);
  });
  it('Should get Vault deposit', async () => {
    const vaultDeposit = await TalaoInstance.vaultDeposit.call();
    assert.equal(vaultDeposit.c, 10);
  });
  it('Should create Vault access', async () => {
    await TalaoInstance.createVaultAccess(5, { from: freelancer });
  });
  it('Vault price should be set.', async () => {
    const freelancerData = await TalaoInstance.data(freelancer);
    const freelancerVaultPrice = freelancerData[0].toNumber();
    assert.equal(freelancerVaultPrice, 5);
  });

  /**
   * Create Freelancer & VaultFactory smart contracts.
   */
  it('Should create the Freelancer smart contract', async () => {
    FreelancerInstance = await Freelancer.new(
      TalaoInstance.address,
      { from: owner }
    );
    assert(FreelancerInstance);
  });
  it('Should create the VaultFactory smart contract', async () => {
    VaultFactoryInstance = await VaultFactory.new(
      TalaoInstance.address,
      FreelancerInstance.address,
      { from: owner }
    );
    assert(VaultFactoryInstance);
  });

  /**
   * Create Freelancer's Vault
   */
  it('Freelancer should be able to create a Vault', async () => {
    let VaultReceipt = await VaultFactoryInstance.createVaultContract(
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      { from: freelancer }
    );
    vaultAddress = VaultReceipt.logs[0].address;
  });
  it('Freelancer should have a Vault now', async () => {
    const hasVault = await VaultFactoryInstance.hasVault.call(
      freelancer,
      { from: someone }
    );
    assert(hasVault);
  });
  it('There should be 1 Vault in total now', async () => {
    const vaultsNb = await VaultFactoryInstance.vaultsNb.call({ from: someone });
    assert.equal(vaultsNb, 1);
  });

  /**
   * Add Freelancer professional information in Freelancer.
   */
  it('Should add information about Freelancer to Vault', async () => {
    const freelancerInfo = await FreelancerInstance.setFreelancer(
      0,
      0,
      '0x00aaff',
      '0x00aaff',
      '0x00aaff',
      '0x00aaff',
      '0x00aaff',
      'Description',
      { from: freelancer }
    );
    assert(freelancerInfo);
  });
  it('Freelancer should be active', async () => {
    const isFreelancerActive = await FreelancerInstance.isActive.call(
      freelancer,
      { from: someone }
    );
    assert(isFreelancerActive);
  });

  /**
   * Talao certificates bot.
   */
  it('Should not allow non set bot to get the Vault address', async () => {
    const vaultAddressNull = await VaultFactoryInstance.getVault.call(
      freelancer,
      { from: bot }
    );
    assert.equal(vaultAddressNull, '0x0000000000000000000000000000000000000000');
  });
  it('Should set the bot address', async () => {
    await FreelancerInstance.setTalaoBot(bot, { from: owner });
    const isTalaoBot = await FreelancerInstance.isTalaoBot.call(
      bot,
      { from: someone }
    );
    assert.equal(isTalaoBot, true);
  });
  it('Should get the bot address, when called by owner.', async () => {
    const getTalaoBot = await FreelancerInstance.getTalaoBot.call({ from: owner });
    assert.equal(getTalaoBot, bot);
  });
  it('Should allow bot to get the Vault address', async () => {
    const botGetVaultAddress = await VaultFactoryInstance.getVault(
      freelancer,
      { from: bot }
    );
    assert.equal(botGetVaultAddress, vaultAddress);
  });

  /**
   * Vault documents CRUD.
   */
  it('Should add document to Vault', async () => {
    if (VaultInstance == null) {
      VaultInstance = Vault.at(vaultAddress);
    }
    const doc1receipt = await VaultInstance.createDoc(
      '0x74657374',
      'Description doc 1',
      1538575228,
      1538575229,
      8, [
        '0x00',
        '0xaa',
        '0xff'
      ],
      4,
      '0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838',
      { from: freelancer }
    );
    const doc1id = doc1receipt.logs[0].args.id.toNumber();
    assert.equal(doc1id, 1);
  });
  it('Should get the document', async () => {
    const doc1 = await VaultInstance.getDoc.call(1, { from: freelancer });
    assert.equal(doc1[1], 'Description doc 1');
  });
  it('Freelance should be able to add a document without IPFS file', async () => {
    const doc2receipt = await VaultInstance.createDoc(
      '0x74657374',
      'Description doc 2',
      1538575228,
      1538575229,
      8, [
        '0x00',
        '0xaa',
        '0xff'
      ],
      4,
      '0x0',
      { from: freelancer }
    );
    const doc2id = doc2receipt.logs[0].args.id.toNumber();
    assert.equal(doc2id, 2);
  });
  it('Freelance should be able to set an IPFS file for the previous document', async () => {
    await VaultInstance.setDocIpfs(
      2,
      '0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838',
      { from: freelancer }
    );
    const doc2ipfs = await VaultInstance.getDoc.call(2, { from: freelancer });
    assert.equal(
      doc2ipfs[7].toString(),
      '0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838'
    );
  });
  it('Freelancer should be able to get the index of all the published documents IDs', async () => {
    const index = await VaultInstance.getDocs.call({ from: freelancer });
    assert.equal(index[0].toNumber(), 1);
    assert.equal(index[1].toNumber(), 2);
  });
  it('Freelancer should be able to add a huge document, all params maxed out', async () => {
    const doc3receipt = await VaultInstance.createDoc(
      '0x4d7920617765736f6d6520646576',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel lorem libero. Aliquam ut mauris quam. Nullam consequat congue mi quis pretium. Curabitur at nunc facilisis quam rhoncus volutpat non ut dui. Donec lacinia ultricies est eget efficitur. Phasellus interdum est quis condimentum fringilla. Donec at tincidunt lorem, mollis suscipit metus. Nunc nunc nibh, viverra ac enim in, tempus hendrerit purus. Quisque non velit ullamcorper, dictum mauris vitae, condimentum erat. Proin imperdiet feugiat est vel consequat.',
      1538575228,
      1538575229,
      8, [
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576',
        '0x4d7920617765736f6d6520646576'
      ],
      4,
      '0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838',
      { from: freelancer }
    );
    const doc3id = doc3receipt.logs[0].args.id.toNumber();
    assert.equal(doc3id, 3, 'should be equal.');
  });
  it('Freelancer should be able to delete a document', async () => {
    await VaultInstance.deleteDoc(2, { from: freelancer });
    const doc2exists = await VaultInstance.isDocPublished.call(2, { from: freelancer });
    assert.equal(doc2exists, false, 'should be false.');
  });
  it('Index should have been updated with document 2 removed', async () => {
    const newIndex = await VaultInstance.getDocs.call({ from: freelancer });
    assert.equal(newIndex[0].toNumber(), 1);
    assert.equal(newIndex[1].toNumber(), 3);
  });

  /**
   * Partner
   */
  it('Should refuse Partner because it was not set yet', async () => {
    const isPartner = await FreelancerInstance.isPartner.call(
      freelancer,
      partner,
      { from: someone }
    );
    assert(!isPartner);
  });
  it('Should set a Partner', async () => {
    const setPartner = await FreelancerInstance.setPartner(
      partner,
      true,
      { from: freelancer }
    );
    assert(setPartner);
  });
  it('Partner should be allowed now', async () => {
    const isPartner2 = await FreelancerInstance.isPartner.call(
      freelancer,
      partner,
      { from: someone }
    );
    assert(isPartner2);
  });
  it('Partner should be able to get the index and the first doc', async () => {
    const doc1index = await VaultInstance.getDocs.call({ from: partner })
    const doc1indexdoc = await VaultInstance.getDoc.call(
      doc1index[0],
      { from: partner }
    );
    assert.equal(doc1indexdoc[1], 'Description doc 1');
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
    assert(talaoTransfer2);
  });
  it('Freelancer 2 should be able to set his Vault price to 0', async () => {
    const createVaultAccess2 = await TalaoInstance.createVaultAccess(
      0,
      { from: freelancer2 }
    );
  });
  it('Freelancer 2 should be able to create a Vault', async () => {
    const vaultReceipt2 = await VaultFactoryInstance.createVaultContract(
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      { from: freelancer2 }
    );
    vaultAddress2 = vaultReceipt2.logs[0].address;
  });
  it('Freelancer 2 should be able add a document to his Vault', async () => {
    if (VaultInstance2 == null) {
      VaultInstance2 = Vault.at(vaultAddress2);
    }
    const f2Doc1receipt = await VaultInstance2.createDoc(
      '0x74657374',
      'Freelancer 2 doc 1',
      1538575228,
      1538575229,
      8, [
        '0x00',
        '0xaa',
        '0xff'
      ],
      4,
      '0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838',
      { from: freelancer2 }
    );
    const f2Doc1Id = f2Doc1receipt.logs[0].args.id.toNumber();
    assert.equal(f2Doc1Id, 1);
  });
  it('Anyone should be able to get the document', async () => {
    const getDoc1Freelance2 = await VaultInstance2.getDoc.call(1, { from: someone });
    assert.equal(getDoc1Freelance2[1], 'Freelancer 2 doc 1');
  });

  /**
   * Import Vault
   */
  it('Should create the ImportVault contract', async () => {
    ImportVaultInstance = await ImportVault.new(VaultInstance.address)
    assert(ImportVaultInstance);
  });
  it('Should list a Partner in order to import docs', async () => {
    const setPartner = await FreelancerInstance.setPartner(
      ImportVaultInstance.address,
      true,
      { from: freelancer }
    );
    assert(setPartner);
  });
  it('Should import a document into a new Vault', async () => {
    const indexOfDocsToImport = await VaultInstance.getDocs.call({ from: partner });
    const newIndex = await VaultInstance.getDocs.call({ from: partner });
    await ImportVaultInstance.importDoc(
      1,
      0,
      indexOfDocsToImport[0].toNumber(),
      { from: partner }
    );
    const originalDoc = await VaultInstance.getDoc.call(
      indexOfDocsToImport[0],
      {from: partner}
    );
    const newDoc = await ImportVaultInstance.getImportedDoc.call(
      1,
      { from: partner }
    );
    assert.equal(originalDoc.toString(), newDoc.toString());
  });

});
