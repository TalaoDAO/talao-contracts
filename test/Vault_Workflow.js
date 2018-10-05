import EVMThrow from './helpers/EVMThrow';
import revert from './helpers/revert';

import latestTime from './helpers/latestTime';
import { increaseTimeTo, duration } from './helpers/increaseTime';

const should = require('chai')
  .use(require('chai-as-promised'))
  .should();

const Talao = artifacts.require("TalaoToken");
const VaultFactory = artifacts.require("VaultFactory");
const Vault = artifacts.require("Vault");
const Freelancer = artifacts.require("Freelancer");
const ImportVault = artifacts.require("ImportVault");

contract('VaultFactory', async (accounts) => {
    let TalaoInstance, VaultFactoryInstance, VaultInstance, FreelancerInstance, ImportVaultInstance
    let TalaoOwnerAddress, VaultAddress;
    // Freelancer, Partner and TalaoBot address.
    // Must be different.
    // Must not be the first address in Ganache as it is already used by default.
    let FreelancerAddress = accounts[1];
    let PartnerAddress = accounts[2];
    // TalaoAdmin is not the Owner, it's another user (typically, the Issuer's backend).
    let TalaoBotAddress = accounts[3];
    // Anonymous user.
    let Someone = accounts[3];
    let tryCatch = require("./exceptions.js").tryCatch;
    let errTypes = require("./exceptions.js").errTypes;

    it("Should get the address of Truffle", async () => {
        TalaoOwnerAddress = accounts[0]; //First account, usually the first address in Ganache, used by default in truffle tests
        assert(TalaoOwnerAddress, "should not be null");
    });

    /**
     * Talao token.
     */
    it("Should create the TalaoToken", async () => {
        TalaoInstance = await Talao.deployed();
        assert(TalaoInstance, "should not be null");
    });
    it("Should mint", async () => {
        let IsMinted = await TalaoInstance.mint(TalaoOwnerAddress, 150000000000000000000);
        assert(IsMinted, "should me minted");
    });
    it("Should stop minting", async () => {
        let HasMintedStopped = await TalaoInstance.finishMinting();
        assert(HasMintedStopped, "should have stopped minting");
    });
    it("Should set vault deposit", async () => {
        await TalaoInstance.setVaultDeposit(10);
    });
    it("Should get balance of Talao", async () => {
        let balance = await TalaoInstance.balanceOf(TalaoOwnerAddress);
        assert.equal(balance.c, 1500000, "should be equals");
    });

    /**
     * In the token, create Vault access with a price of 5 TALAO for the Freelancer.
     */
    it("Should transfer TALAOs to Freelance", async () => {
        let IsTransferDone = await TalaoInstance.transfer(FreelancerAddress, 20, { from: TalaoOwnerAddress });
        assert(IsTransferDone, "should have transfered");
    });
    it("Should get balance of user", async () => {
        let balance = await TalaoInstance.balanceOf(FreelancerAddress);
        assert.equal(balance.c, 20, "should be equals");
    });
    it("Should get vault deposit", async () => {
        let vaultDeposit = await TalaoInstance.vaultDeposit.call();
        assert.equal(vaultDeposit.c, 10, "numbers should be equals");
    });
    it("Should create vault access", async () => {
        await TalaoInstance.createVaultAccess(5, { from: FreelancerAddress });
    });
    it('Vault price should be set.', async () => {
      const newData = await TalaoInstance.data(FreelancerAddress);
      let newPrice = newData[0].toNumber();
      assert.equal(newPrice, 5, 'Should be equal.');
    });

    /**
     * Create Freelancer & VaultFactory smart contracts.
     */
    it("Should create the Freelancer smart contract", async () => {
        FreelancerInstance = await Freelancer.new(TalaoInstance.address, { from: TalaoOwnerAddress });
        assert(FreelancerInstance, "should not be null");
    });
    it("Should create the VaultFactory smart contract", async () => {
        VaultFactoryInstance = await VaultFactory.new(TalaoInstance.address, FreelancerInstance.address, { from: TalaoOwnerAddress });
        assert(VaultFactoryInstance, "should not be null");
    });

    /**
     * Create Freelancer's Vault
     */
    it('Freelancer should be able to create a Vault', async () => {
        let VaultReceipt = await VaultFactoryInstance.createVaultContract(0,0,0,0,0,0,0, { from: FreelancerAddress });
        VaultAddress = VaultReceipt.logs[0].address;
    });
    it('Freelancer should have a Vault now', async () => {
        const hasVault = await VaultFactoryInstance.hasVault.call(FreelancerAddress, { from: Someone });
        assert(hasVault, 'Should be true.');
    });
    it('There should be 1 Vault in total now', async () => {
        const vaultsNb = await VaultFactoryInstance.vaultsNb.call({ from: Someone });
        assert.equal(vaultsNb, 1, 'Should be equal.');
    });

    /**
     * Add Freelancer professional information in Freelancer.
     */
    it("Should add information about Freelancer to Vault", async () => {
        let FreelancerInfo = await FreelancerInstance.setFreelancer(0,0,"0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "Description", { from: FreelancerAddress });
        assert(FreelancerInfo, "should not be null");
    });
    it("Freelancer should be active", async () => {
        let isFreelancerActive = await FreelancerInstance.isActive.call(FreelancerAddress, { from: Someone });
        assert.equal(isFreelancerActive, true, 'should be true.');
    });

    /**
     * TalaoBot
     */
    it("Should not allow non set TalaoBot address to get the Vault address", async () => {
        let VaultAddressNull = await VaultFactoryInstance.getVault.call(FreelancerAddress, { from: TalaoBotAddress });
        assert.equal(VaultAddressNull, '0x0000000000000000000000000000000000000000', "should be equal");
    });
    it("Should set the TalaoBot address", async () => {
        await FreelancerInstance.setTalaoBot(TalaoBotAddress, { from: TalaoOwnerAddress });
        let isTalaoBot = await FreelancerInstance.isTalaoBot.call(TalaoBotAddress, { from: Someone });
        assert.equal(isTalaoBot, true, "should be true");
    });
    it("Should get the TalaoBot address, when called by owner.", async () => {
        let GetTalaoBot = await FreelancerInstance.getTalaoBot.call({ from: TalaoOwnerAddress });
        assert.equal(GetTalaoBot, TalaoBotAddress, "should be equal");
    });
    it("Should allow TalaoBot to get the Vault address", async () => {
        let VaultAddress2 = await VaultFactoryInstance.getVault(FreelancerAddress, { from: TalaoBotAddress });
        assert.equal(VaultAddress2, VaultAddress, "should be equal");
    });

    /**
     * Vault documents CRUD.
     */
    it("Should add document to Vault", async () => {
        if(VaultInstance == null) VaultInstance = Vault.at(VaultAddress);
        const doc1receipt = await VaultInstance.createDoc("0x74657374", "Description doc 1", 1538575228, 1538575229, 8, ["0x00", "0xaa", "0xff"], [5, 4, 3], 4, "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838", { from: FreelancerAddress });
        const doc1id = doc1receipt.logs[0].args.id.toNumber();
        assert.equal(doc1id, 1, "should be equal.");
    });
    it("Should get the document", async () => {
        const doc1 = await VaultInstance.getDoc.call(1, { from: FreelancerAddress });
        assert.equal(doc1[8], "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838");
    });
    it("Freelance should be able to add a document without IPFS file", async () => {
        const doc2receipt = await VaultInstance.createDoc("0x74657374", "Description doc 2", 1538575228, 1538575229, 8, ["0x00", "0xaa", "0xff"], [5, 4, 3], 4,  "0x0", { from: FreelancerAddress });
        const doc2id = doc2receipt.logs[0].args.id.toNumber();
        assert.equal(doc2id, 2, "should be equal.");
    });
    it("Freelance should be able to add an IPFS file to the previous document", async () => {
        await VaultInstance.addDocIpfs(2, "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838", { from: FreelancerAddress });
        const doc2ipfs = await VaultInstance.getDocIpfs.call(2, { from: FreelancerAddress });
        assert.equal(doc2ipfs, "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838");
    });
    it("Freelancer should be able to get the index of all the published documents IDs", async () => {
        const index = await VaultInstance.getDocs.call({ from: FreelancerAddress });
        assert.equal(index[0].toNumber(), 1, 'First document should have ID = 1.');
        assert.equal(index[1].toNumber(), 2, 'Second document should have ID = 2.');
    });
    it("Freelancer should be able to get a document by it\'s index position", async () => {
        const doc1getByIndex = await VaultInstance.getDocByIndex.call(1, { from: FreelancerAddress });
        assert.equal(doc1getByIndex[2].toNumber(), 1538575228, 'Should be equal.');
    });
    it("Freelance should be able to add a huge document, all params maxed out", async () => {
        const doc3receipt = await VaultInstance.createDoc("0x4d7920617765736f6d6520646576", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel lorem libero. Aliquam ut mauris quam. Nullam consequat congue mi quis pretium. Curabitur at nunc facilisis quam rhoncus volutpat non ut dui. Donec lacinia ultricies est eget efficitur. Phasellus interdum est quis condimentum fringilla. Donec at tincidunt lorem, mollis suscipit metus. Nunc nunc nibh, viverra ac enim in, tempus hendrerit purus. Quisque non velit ullamcorper, dictum mauris vitae, condimentum erat. Proin imperdiet feugiat est vel consequat.", 1538575228, 1538575229, 8, ["0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576"], [5, 4, 3, 5, 4], 4,  "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838", { from: FreelancerAddress });
        const doc3id = doc3receipt.logs[0].args.id.toNumber();
        assert.equal(doc3id, 3, "should be equal.");
    });
    it("Freelancer should be able to delete a document", async () => {
        await VaultInstance.deleteDoc(2, { from: FreelancerAddress });
        const doc2exists = await VaultInstance.isDocPublished.call(2, { from: FreelancerAddress });
        assert.equal(doc2exists, false, "should be false.")
    });
    it("Documents index should have been updated with the document 2 removed", async () => {
        const newIndex = await VaultInstance.getDocs.call({ from: FreelancerAddress });
        assert.equal(newIndex[0].toNumber(), 1, 'First document should have ID = 1.');
        assert.equal(newIndex[1].toNumber(), 3, 'Second document should have ID = 3.');
    });

    /**
     * Partner
     */
    it("Should refuse Partner because it was not set yet", async () => {
        let isPartner = await FreelancerInstance.isPartner.call(FreelancerAddress, PartnerAddress, { from: Someone });
        assert.equal(isPartner, false, "should be false");
    });
    it("Should set a Partner", async () => {
        let Partner = await FreelancerInstance.setPartner(PartnerAddress, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Partner should be allowed now", async () => {
        let isPartner2 = await FreelancerInstance.isPartner.call(FreelancerAddress, PartnerAddress, { from: Someone });
        assert.equal(isPartner2, true, "should be true");
    });
    it("Partner should be able to get the documents index and get the first doc", async () => {
        const doc1index = await VaultInstance.getDocs.call({ from: PartnerAddress })
        const doc1indexdoc = await VaultInstance.getDoc.call(doc1index[0], { from: PartnerAddress })
        assert.equal(doc1indexdoc[1], "Description doc 1");
    });

    /**
     * Import Vault
     */
    it("Should create the ImportVault contract", async () => {
        ImportVaultInstance = await ImportVault.new(VaultInstance.address)
        assert(ImportVaultInstance, "should not be null");
    });
    it("Should list a Partner in order to import docs", async () => {
        let Partner = await FreelancerInstance.setPartner(ImportVaultInstance.address, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Should import a document into a new Vault", async () => {
        const indexOfDocsToImport = await VaultInstance.getDocs.call({ from: PartnerAddress })
        await ImportVaultInstance.importDoc(0, indexOfDocsToImport[0], { from: PartnerAddress })
        let originalDoc = await VaultInstance.getDoc.call(indexOfDocsToImport[0], {from: PartnerAddress})
        let newDoc = await ImportVaultInstance.getImportedDoc.call(0, { from: PartnerAddress })
        assert.equal(originalDoc.toString(), newDoc.toString())
    });

});
