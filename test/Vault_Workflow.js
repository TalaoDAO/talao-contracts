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

//Tests sur :
// - Ajout du freelancer
// - Liste de partenaires

contract('VaultFactory', async (accounts) => {
    let TalaoInstance, VaultFactoryInstance, VaultInstance, FreelancerInstance, ImportVaultInstance
    let TalaoOwnerAddress, VaultAddress;
    // Freelancer, Partner and TalaoAdmin address.
    //Must be different
    //Must not be the first address in Ganache as it is already used by default
    let FreelancerAddress = accounts[1];
    let PartnerAddress = accounts[2];
    let TalaoAdminAddress = accounts[3];
    let tryCatch = require("./exceptions.js").tryCatch;
    let errTypes = require("./exceptions.js").errTypes;

    it("Should get the address of Truffle", async () => {
        TalaoOwnerAddress = accounts[0]; //First account, usually the first address in Ganache, used by default in truffle tests
        assert(TalaoOwnerAddress, "should not be null");
    });
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
    it("Should transfer", async () => {
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
    it("Should create the freelancer", async () => {
        FreelancerInstance = await Freelancer.new(TalaoInstance.address, { from: TalaoOwnerAddress });
        assert(FreelancerInstance, "should not be null");
    });
    it("Should create the VaultFactory", async () => {
        VaultFactoryInstance = await VaultFactory.new(TalaoInstance.address, FreelancerInstance.address, { from: TalaoOwnerAddress });
        assert(VaultFactoryInstance, "should not be null");
    });
    it("Should create a new Vault", async () => {
        let VaultReceipt = await VaultFactoryInstance.CreateVaultContract(0,0,0,0,0,0,0,0, { from: FreelancerAddress });
        VaultAddress = VaultReceipt.logs[0].address;
    });
    it("Should add information about Freelancer to Vault", async () => {
        let FreelancerInfo = await FreelancerInstance.UpdateFreelancerData(0,0,"0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "Description", { from: FreelancerAddress });
        assert(FreelancerInfo, "should not be null");
    });
    it("Should not allow non set TalaoAdmin address to get the Vault address", async () => {
        let VaultAddressNull = await VaultFactoryInstance.GetVault(FreelancerAddress, { from: TalaoAdminAddress });
        assert.equal(VaultAddressNull, '0x0000000000000000000000000000000000000000', "should be equal");
    });
    it("Should set the TalaoAdmin address", async () => {
        await FreelancerInstance.setTalaoAdmin(TalaoAdminAddress, { from: TalaoOwnerAddress });
        let isTalaoAdmin = await FreelancerInstance.isTalaoAdmin(TalaoAdminAddress);
        assert.equal(isTalaoAdmin, true, "should be true");
    });
    it("Should allow TalaoAdmin to get the Vault address", async () => {
        let VaultAddress2 = await VaultFactoryInstance.GetVault(FreelancerAddress, { from: TalaoAdminAddress });
        assert.equal(VaultAddress2, VaultAddress, "should be equal");
    });
    it("Should refuse the partner", async () => {
        let isPartner = await FreelancerInstance.isPartner(FreelancerAddress, PartnerAddress);
        assert.equal(isPartner, false, "should be false");
    });
    it("Should allow a partner to visit his Vault", async () => {
        let Partner = await FreelancerInstance.listPartner(PartnerAddress, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Should allow the partner", async () => {
        let isPartner2 = await FreelancerInstance.isPartner(FreelancerAddress, PartnerAddress);
        assert.equal(isPartner2, true, "should be true");
    });
    it("Should add document to Vault", async () => {
        if(VaultInstance == null) VaultInstance = Vault.at(VaultAddress);
        let VaultDoc = await VaultInstance.addDocument("0x00aaff", "0x00aaff", "0x00aaff", ["0x00", "0xaa", "0xff"], [5, 4, 3], 2, 56, 57, 0, { from: FreelancerAddress });
        //await VaultInstance.addDocument("0x00aaee", "0x00aaff", "0x00aaff", ["0x00", "0xaa", "0xff"], [4, 5, 4], 2, 56, 57, { from: FreelancerAddress });
        //await VaultInstance.addDocument("0x00aadd", "0x00aaff", "0x00aaff", ["0x00", "0xbb"], [1, 0], 2, 56, 57, { from: FreelancerAddress });
        assert(VaultDoc, "should not be null");
    });
    it("Should not add document to Vault because keywords and ratings do not match", async () => {
        if(VaultInstance == null) VaultInstance = Vault.at(VaultAddress);
        await tryCatch(VaultInstance.addDocument("0x00aaaa", "0x00aaff", "0x00aaff", ["0x00", "0xaa"], [4], 2, 56, 57, 0, { from: FreelancerAddress }), errTypes.revert);
    });
    it("Should get the document", async () => {
        expect(() => {
            VaultInstance.getCertifiedDocumentById("0x00aaff", { from: FreelancerAddress });
        }).to.not.throw();
    });
    it("Should get all the indexes", async () => {
        let docs = await VaultInstance.getDocumentIndexes.call()
        console.log(docs)
    });
    it("Should be able to get document", async () => {
        let docs = await VaultInstance.getDocumentIndexes.call()
        let doc = await VaultInstance.getFullDocument(docs[0], {from: PartnerAddress})
        console.log(doc)
        assert.isTrue(doc[4])
        assert.equal(doc[8].toNumber(), 57)
    });
    it("Should create the ImportVault contract", async () => {
        ImportVaultInstance = await ImportVault.new(VaultInstance.address)
        assert(ImportVaultInstance, "should not be null");
    });
    it("Should allow a partner in order to import docs", async () => {
        let Partner = await FreelancerInstance.listPartner(ImportVaultInstance.address, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Should import a document into a new vault", async () => {
        let docs = await VaultInstance.getDocumentIndexes.call()
        await ImportVaultInstance.importDocument(0, docs[0])
        let doc = await VaultInstance.getFullDocument(docs[0], {from: PartnerAddress})
        let new_doc = await ImportVaultInstance.getFullDocument.call(0)
        assert.equal(doc.toString(), new_doc.toString())
    });

});
