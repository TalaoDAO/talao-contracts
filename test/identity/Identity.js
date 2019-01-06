const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Identity = artifacts.require('Identity');

// Contract instances.
let token, identity;

// Data samples.
const category = 1001;
const textCategory = 8;
const textToEncrypt = 'Hi, here is a message for your eyes only!';
const fileEngine = 1;
const fileType = 12;
const fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
/**
 * Encryption & decryption is out of the scope of those contracts code evaluation.
 * We just use some data samples that look like real ones.
 */
const asymetricEncryptionAlgorithm = 1; // RSA 2048
const asymetricEncryptionPublicKey = '0x2d2d2d2d2d424547494e205055424c4943204b45592d2d2d2d2d0a4d494942496a414e42676b71686b6947397730424151454641414f43415138414d49494243674b43415145417a747a73382b643452415373384641644b39766f0a31576a6c4e79554e5a54765747653637514751584249315841647a6752673233362b6a442f4a5579736b71686975614f6736434e7a495934677053325165345a0a6870453042575a704237514d4166684e42424e42686a6e527247306d3056775933696b2b2f42325133714639356c6e6535654f49585279366962695a53324e6a0a676f634c7937754e37536233537462582b784c3848742b4c33394c4c646d476b71496539573133356f37377a4935724e6c4b7931594e6d576f51717035382f630a474a614a6874526e31376f374555764f326230734e542b646b6843796f7138442b6e6874317a5847706c794c43436a37356c6f3969517a706559666346484c580a587a446d2b7737442b42546c63383632664339353363536f794e7a366f714474514f434d7955744753776b6f3074627763677353366271366a3252763968414b0a4f774944415141420a2d2d2d2d2d454e44205055424c4943204b45592d2d2d2d2d';
const symetricEncryptionAlgorithm = 1; // aes-128-ctr
const symetricEncryptionEncryptedKey = '0x7ac75d0b4dae6bd45cc7da2afc21d6e7e02723be57ba2d2370cec277cb83eff04ccae152d53b2d24424689395caf513050b2865ecfb9acc33565b9808e948680e353a0ed86d36c6d2576344815641739445aac09ec59337aae6aa7f2be8650e8638d451b5be8f71160f1fdc4642db85f53bca4b78ed0a33437b977e685285937664f01d57a21c32530beb580c63fbdfe461426e6833fa365b3990512891ac2a38aea408c309e725d226aa6d91151f2a1b1864b43a744fc084ee420f66f0a683cef448c77cc4110b74c5c9fda352531963c49b92ebef363cbfd5ca4bf4e2e0e9878a1ce9bf902fcaaa33a4f2ef221dc9daa78cc7dde4f33226088d28381142ba6'

// Tests.
contract('Identity', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const factory = accounts[8];
  const someone = accounts[9];

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Identity.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Identity.link(ClaimHolderLibrary, claimHolderLibrary.address);
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
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  it('Deploy and init contract', async() => {
    identity = await Identity.new(
      foundation.address,
      token.address,
      category,
      asymetricEncryptionAlgorithm,
      symetricEncryptionAlgorithm,
      asymetricEncryptionPublicKey,
      symetricEncryptionEncryptedKey,
      {from: factory}
    );
    assert(identity);
    await foundation.setInitialOwnerInFoundation(identity.address, user1, {from: factory});
    await identity.addKey(web3.utils.keccak256(user1), 1, 1, {from: factory});
  });

  it('Contract creator should be Factory', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[0], factory);
  });

  it('Anyone should get contract category: Freelancer', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[1].toNumber(), category);
  });

  it('Anyone should get asymetric encryption algorithm: RSA 2048', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[2].toNumber(), asymetricEncryptionAlgorithm);
  });

  it('Anyone should get symetric encryption algorithm: AES 128', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[3].toNumber(), symetricEncryptionAlgorithm);
  });

  it('Anyone should be able to get the asymetric encryption public key', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[4], asymetricEncryptionPublicKey);
  });

  it('Anyone should get the encrypted symetric encryption passphrase', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[5], symetricEncryptionEncryptedKey);
  });

  it('User2 should be able to send a text, anyone should be able to retrieve it', async() => {
    // Send text.
    const result2 = await identity.identityboxSendtext(
      textCategory,
      web3.utils.asciiToHex('This message should be encrypted on User1\'s asymetric public key if User2 wants it to be private'),
      {from: user2}
    );
    // Check event.
    truffleAssert.eventEmitted(result2, 'TextReceived', event => {
      return (
        event.sender == user2 && event.category == textCategory
      );
    });
    // User1 reads event and gets text.
    const event = result2.logs[0].args;
    const text = web3.utils.hexToAscii(event.text);
    // Is it the original message?
    assert.equal(text, 'This message should be encrypted on User1\'s asymetric public key if User2 wants it to be private');
  });

  it('User2 should send a file and User1 should see the event', async() => {
    // Encryption not tested again and file upload not tested.
    const result = await identity.identityboxSendfile(
      fileType,
      fileEngine,
      fileHash,
      {from: user2}
    );
    // Check event.
    truffleAssert.eventEmitted(result, 'FileReceived', event => {
      return (
        event.sender == user2 && event.fileType == fileType
      );
    });
    // Check data.
    const event = result.logs[0].args;
    assert(event.fileEngine == fileEngine);
    assert(event.fileHash == fileHash);
  });

  it('User1 should blacklist User2', async() => {
    const result = await identity.identityboxBlacklist(user2, {from: user1});
    assert(result);
  });

  it('User2 should fail to send a text', async() => {
    truffleAssert.fails(
      identity.identityboxSendtext(
        textCategory,
        textToEncrypt,
        {from: user2}
      )
    );
  });

  it('User1 should unblacklist User2', async() => {
    const result = await identity.identityboxUnblacklist(user2, {from: user1});
    assert(result);
  });

  it('User2 should send a text', async() => {
    const result = await identity.identityboxSendtext(
      textCategory,
      textToEncrypt,
      {from: user2}
    );
    // Check event.
    truffleAssert.eventEmitted(result, 'TextReceived', event => {
      return (
        event.sender == user2 && event.category == textCategory
      );
    });
  });

  it('User1 gives Identity purpose to User3 to manage blacklists', async() => {
    const user3key = web3.utils.keccak256(user3);
    const result = await identity.addKey(user3key, 20004, 1, {from: user1});
    assert(result);
  });

  it('User3 should be able to blacklist User2', async() => {
    const result = identity.identityboxBlacklist(user2, {from: user3});
    assert(result);
  });

  it('User1 should be the Active Identity Owner', async() => {
    const result = await identity.isActiveIdentityOwner({from: user1});
    assert(result);
  });

  it('User1 should have Identity purpose for Management and therefore any Identity purpose', async() => {
    const result1 = await identity.hasIdentityPurpose(1, {from: user1});
    assert(result1);
    const result2 = await identity.hasIdentityPurpose(12345689, {from: user1});
    assert(result2);
  });

  it('Anyone should see that Identity is active', async() => {
    const result = await identity.isActiveIdentity({from: someone});
    assert(result);
  });

  it('User1 closes his Vault access in the token, he should not be the Active Identity Owner', async() => {
    await token.closeVaultAccess({from: user1});
    const result = await identity.isActiveIdentityOwner({from: user1});
    assert(!result);
  });

  it('User1 should not have Identity purpose at all anymore', async() => {
    const result1 = await identity.hasIdentityPurpose(1, {from: user1});
    assert(!result1);
    const result2 = await identity.hasIdentityPurpose(123456789, {from: user1});
    assert(!result2);
  });

  it('Anyone can see that Identity is not Active', async() => {
    const result = await identity.isActiveIdentity({from: someone});
    assert(!result);
  });

});
