const Talao = artifacts.require("./TalaoToken");
const VaultFactory = artifacts.require("./VaultFactory");
const Vault = artifacts.require("./Vault");
const Freelancer = artifacts.require("./Freelancer");

contract('VaultFactory', async (accounts) => {
    let TalaoInstance, VaultFactoryInstance, VaultInstance, FreelancerInstance
    let TalaoAddress;
    //Freelancer and Partner address 
    //Must be different
    //Must not be the first address in Ganache as it is already used by default
    let FreelancerAddress = "0xfc7b86670eFC68df0427A6E8a979bc1acBCA76B3";
    let PartnerAddress = "0x4D3d9c29922bF527cb9927d5E245b6a60e8aC6C1";
    let tryCatch = require("./exceptions.js").tryCatch;
    let errTypes = require("./exceptions.js").errTypes;

    it("Should get the address of Truffle", async () => {
        TalaoAddress = accounts[0]; //First account, usually the first address in Ganache, used by defualt in truffle tests
        assert(TalaoAddress, "should not be null");
    });
    it("Should create the TalaoToken", async () => {
        TalaoInstance = await Talao.deployed();
        assert(TalaoInstance, "should not be null");
    });
    it("Should mint", async () => {
        let IsMinted = await TalaoInstance.mint(TalaoAddress, 150000000000000000000);
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
        let balance = await TalaoInstance.balanceOf(TalaoAddress);
        assert.equal(balance.c, 1500000, "should be equals");
    });
    it("Should transfer", async () => {
        let IsTransferDone = await TalaoInstance.transfer(FreelancerAddress, 20, { from: TalaoAddress });
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
        FreelancerInstance = await Freelancer.new(TalaoInstance.address, { from: FreelancerAddress });
        assert(FreelancerInstance, "should not be null");
    });
    it("Should create the VaultFactory", async () => {
        VaultFactoryInstance = await VaultFactory.new(TalaoInstance.address, FreelancerInstance.address);
        assert(VaultFactoryInstance, "should not be null");
    });
    it("Should create a new Vault", async () => {
        var VaultCreation = VaultFactoryInstance.VaultCreation();
        VaultCreation.watch(function (error, result) {
            if (!error)
                VaultInstance = Vault.at(result.args.vaultaddress);
        });
        await VaultFactoryInstance.CreateVaultContract({ from: FreelancerAddress });
    });
    it("Should add information about Freelancer to Vault", async () => {
        let FreelancerInfo = await FreelancerInstance.subscribe("0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", "0x00aaff", { from: FreelancerAddress });
        assert(FreelancerInfo, "should not be null");
    });
    it("Should refuse the partner", async () => {
        let isPartner = await FreelancerInstance.isPartner(PartnerAddress);
        assert.equal(isPartner, false, "should be false");
    });
    it("Should allow a partner to visit his Vault", async () => {
        let Partner = await FreelancerInstance.listPartner(PartnerAddress, true, { from: FreelancerAddress });
        assert(Partner, "should not be null");
    });
    it("Should allow the partner", async () => {
        let isPartner2 = await FreelancerInstance.isPartner(PartnerAddress);
        assert.equal(isPartner2, true, "should be true");
    });
    it("Should add document to Vault", async () => {
        let VaultDoc = await VaultInstance.addDocument("0x00aaff", "0x00aaff", ["0x00", "0xaa", "0xff", "0x00"], 2, 56, 57, true, { from: FreelancerAddress });
        await VaultInstance.addDocument("0x00aaee", "0x00aaff", ["0x00", "0xaa", "0xff", "0x00"], 2, 56, 57, true, { from: FreelancerAddress });
        await VaultInstance.addDocument("0x00aadd", "0x00aaff", ["0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00", "0x00"], 2, 56, 57, true, { from: FreelancerAddress });
        assert(VaultDoc, "should not be null");
    });
    it("Should get the scoring of the Vault", async () => {
        let Score = await VaultInstance.getScoring({ from: FreelancerAddress });
        assert.equal(Score.c, 22, "numbers should be equals");
    });
    it("Should get the scoring of the Vault as a partner", async () => {
        let Score2 = await VaultInstance.getScoring({ from: PartnerAddress });
        assert.equal(Score2.c, 22, "numbers should be equals");
    });
    it("Should not get the scoring of the Vault with an unauthorized address", async () => {
        await tryCatch(VaultInstance.getScoring(), errTypes.revert);
    });
    it("Should get the scoring for a specific keyword", async () => {
        let ScoreWithKeyword = await VaultInstance.getScoringByKeyword("0x00", { from: FreelancerAddress });
        assert.equal(ScoreWithKeyword.c, 30, "numbers should be equals");
    });
    it("Should get the document", async () => {
        expect(() => {
            VaultInstance.getCertifiedDocumentById("0x00aaff", { from: FreelancerAddress });
        }).to.not.throw();
    });
});