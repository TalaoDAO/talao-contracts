const Talao = artifacts.require("./TalaoToken");
const VaultFactory = artifacts.require("./VaultFactory");
const Vault = artifacts.require("./Vault");

contract('VaultFactory', async (accounts) => {
    let TalaoInstance, VaultFactoryInstance, VaultInstance, account1
    let GanacheAddress = "0xfc7b86670eFC68df0427A6E8a979bc1acBCA76B3"; //To replace with your own ganache address
    it("Should get the address of Truffle", async () => {
        account1 = accounts[0]; // first account
        assert(account1, "should not be null");
    });
    it("Should create the TalaoToken", async () => {
        TalaoInstance = await Talao.deployed();
        assert(TalaoInstance, "should not be null");
    });
    it("Should mint", async () => {
        let IsMinted = await TalaoInstance.mint(account1, 150000000000000000000);
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
        let balance = await TalaoInstance.balanceOf(account1);
        assert.equal(balance.c, 1500000, "should be equals");
    });
    it("Should transfer", async () => {
        let IsTransferDone = await TalaoInstance.transfer(GanacheAddress, 20, { from: account1 });
        assert(IsTransferDone, "should have transfered");
    });
    it("Should get balance of user", async () => {
        let balance = await TalaoInstance.balanceOf(GanacheAddress);
        assert.equal(balance.c, 20, "should be equals");
    });
    it("Should get vault deposit", async () => {
        let vaultDeposit = await TalaoInstance.vaultDeposit.call();
        assert.equal(vaultDeposit.c, 10, "numbers should be equals");
    });
    it("Should create vault access", async () => {
        var VaultEvent = TalaoInstance.Vault();
        VaultEvent.watch(function (error, result) {
            if (!error) {
                console.log(result.args.client + " " + result.args.freelance + " " + result.args.status);
            } else {
                console.log("Error !!!" + error);
            }
        });
        let vaultAccess = await TalaoInstance.createVaultAccess(5, { from: GanacheAddress });
    });
    it("Should create the VaultFactory", async () => {
        VaultFactoryInstance = await VaultFactory.new(TalaoInstance.address);
        assert(VaultFactoryInstance, "should not be null");
    });
    it("Should create a new Vault", async () => {
        let VaultReceipt = await VaultFactoryInstance.CreateVaultContract({ from: GanacheAddress });
        let VaultAddress = VaultReceipt.logs[0].address;
        expect(() => {
            VaultInstance = Vault.at(VaultAddress);
        }).to.not.throw();
    });
    it("Should add documen to Vault", async () => {
        let VaultDoc = await VaultInstance.addDocument("0x00aaff", "0x00aaff", ["0x00", "0xaa", "0xff"], 2, 56, 57, true, { from: GanacheAddress });
        assert(VaultDoc, "should not be null");
    });
    it("Should get the scoring of the Vault", async () => {
        let Score = await VaultInstance.getScoring({ from: GanacheAddress });
        assert.equal(Score, 5, "numbers should be equals");
    });
    it("Should get the document", async () => {
        expect(() => {
            let VaultDocument = VaultInstance.getCertifiedDocumentById("0x00aaff", { from: GanacheAddress });
        }).to.not.throw();
    });
});