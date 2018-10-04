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
        let VaultReceipt = await VaultFactoryInstance.createVaultContract(0,0,0,0,0,0,0,0, { from: FreelancerAddress });
        VaultAddress = VaultReceipt.logs[0].address;
    });
    it("Should add information about Freelancer to Vault", async () => {
        let FreelancerInfo = await FreelancerInstance.setFreelancer(0,0,"0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "Description", { from: FreelancerAddress });
        assert(FreelancerInfo, "should not be null");
    });
    it("Should not allow non set TalaoBot address to get the Vault address", async () => {
        let VaultAddressNull = await VaultFactoryInstance.getVault(FreelancerAddress, { from: TalaoBotAddress });
        assert.equal(VaultAddressNull, '0x0000000000000000000000000000000000000000', "should be equal");
    });
    it("Should set the TalaoBot address", async () => {
        await FreelancerInstance.setTalaoBot(TalaoBotAddress, { from: TalaoOwnerAddress });
        let isTalaoBot = await FreelancerInstance.isTalaoBot(TalaoBotAddress);
        assert.equal(isTalaoBot, true, "should be true");
    });
    it("Should get the TalaoBot address, when called by owner.", async () => {
        let GetTalaoBot = await FreelancerInstance.getTalaoBot({ from: TalaoOwnerAddress });
        assert.equal(GetTalaoBot, TalaoBotAddress, "should be equal");
    });
    it("Should allow TalaoBot to get the Vault address", async () => {
        let VaultAddress2 = await VaultFactoryInstance.getVault(FreelancerAddress, { from: TalaoBotAddress });
        assert.equal(VaultAddress2, VaultAddress, "should be equal");
    });
    it("Should refuse the partner", async () => {
        let isPartner = await FreelancerInstance.isPartner(FreelancerAddress, PartnerAddress);
        assert.equal(isPartner, false, "should be false");
    });
    it("Should allow a partner to visit his Vault", async () => {
        let Partner = await FreelancerInstance.setPartner(PartnerAddress, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Should allow the partner", async () => {
        let isPartner2 = await FreelancerInstance.isPartner(FreelancerAddress, PartnerAddress);
        assert.equal(isPartner2, true, "should be true");
    });
    it("Should add document to Vault", async () => {
        if(VaultInstance == null) VaultInstance = Vault.at(VaultAddress);
        const doc1receipt = await VaultInstance.createDoc("0x74657374", "Description doc 1", 1538575228, 1538575229, 8, ["0x00", "0xaa", "0xff"], [5, 4, 3], 4, "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838", { from: FreelancerAddress });
        const doc1id = doc1receipt.logs[0].args.id.toNumber();
        assert.equal(doc1id, 1, "should be equal.");
    });
    it("Should get the document", async () => {
        expect(() => {
            VaultInstance.getDoc(1, { from: FreelancerAddress });
        }).to.not.throw();
    });
    it("Freelancer should be able to get the documents index", async () => {
        const index = await VaultInstance.getDocumentsIndex.call({ from: FreelancerAddress })
    });
    it("Partner should be able to get the documents index and get the first doc", async () => {
        const doc1index = await VaultInstance.getDocumentsIndex.call({ from: PartnerAddress })
        const doc1indexdoc = await VaultInstance.getDoc(doc1index[0], { from: PartnerAddress })
        assert.equal(doc1indexdoc[1], "Description doc 1");
        assert.equal(doc1indexdoc[3].toNumber(), 1538575229);
    });
    it("Freelance should be able to add a document without IPFS file, and then add an IPFS file to the document", async () => {
        const doc2receipt = await VaultInstance.createDoc("0x74657374", "Description doc 2", 1538575228, 1538575229, 8, ["0x00", "0xaa", "0xff"], [5, 4, 3], 4,  "0x0", { from: FreelancerAddress });
        const doc2id = doc2receipt.logs[0].args.id.toNumber();
        assert.equal(doc2id, 2, "should be equal.");
        await VaultInstance.addDocIpfs(doc2id, "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838", { from: FreelancerAddress });
        const doc2ipfs = await VaultInstance.getDocIpfs(doc2id, { from: FreelancerAddress });
        assert.equal(doc2ipfs, "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838");
    });
    it("Freelance should be able to add a huge document, all params maxed out", async () => {
        const doc3receipt = await VaultInstance.createDoc("0x4d7920617765736f6d6520646576", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel lorem libero. Aliquam ut mauris quam. Nullam consequat congue mi quis pretium. Curabitur at nunc facilisis quam rhoncus volutpat non ut dui. Donec lacinia ultricies est eget efficitur. Phasellus interdum est quis condimentum fringilla. Donec at tincidunt lorem, mollis suscipit metus. Nunc nunc nibh, viverra ac enim in, tempus hendrerit purus. Quisque non velit ullamcorper, dictum mauris vitae, condimentum erat. Proin imperdiet feugiat est vel consequat.", 1538575228, 1538575229, 8, ["0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576", "0x4d7920617765736f6d6520646576"], [5, 4, 3, 5, 4], 4,  "0x6142b269b7b163be4d5679d06632e913dd1fe35eae3b3e7e03de0c8fd26f9838", { from: FreelancerAddress });
        const doc3id = doc3receipt.logs[0].args.id.toNumber();
        assert.equal(doc3id, 3, "should be equal.");
    });
    it("Should create the ImportVault contract", async () => {
        ImportVaultInstance = await ImportVault.new(VaultInstance.address)
        assert(ImportVaultInstance, "should not be null");
    });
    it("Should list a Partner in order to import docs", async () => {
        let Partner = await FreelancerInstance.setPartner(ImportVaultInstance.address, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Should import a document into a new Vault", async () => {
        const indexOfDocsToImport = await VaultInstance.getDocumentsIndex.call({ from: PartnerAddress })
        await ImportVaultInstance.importDoc(0, indexOfDocsToImport[0], { from: PartnerAddress })
        let originalDoc = await VaultInstance.getDoc(indexOfDocsToImport[0], {from: PartnerAddress})
        let newDoc = await ImportVaultInstance.getImportedDoc(0, { from: PartnerAddress })
        assert.equal(originalDoc.toString(), newDoc.toString())
    });

});
