const crypto = require('crypto');
const NodeRSA = require('node-rsa');
const aesjs = require('aes-js');
const web3 = require('web3');
const truffleAssert = require('truffle-assertions');
const erc735js = require('erc735js');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Identity = artifacts.require('Identity');

// Contract instances.
let token, identity;

// Asymetric encryption key.
const asymetricEncryptionAlgorithm = 1; // RSA 2048 with defaults from https://github.com/rzcoder/node-rsa
let asymetricEncryptionKey, asymetricEncryptionPublickey, asymetricEncryptionPrivatekey;

// Symetric encryption key.
const symetricEncryptionPassphrase = 'This is the passphrase for the symetric key I chose at contract creation.';
const symetricEncryptionAlgorithm = 1; // aes-128-ctr

// Data samples.
const category = 1001;
const textCategory = 8;
const textToEncrypt = 'Hi, here is a message for your eyes only!';
const fileEngine = 1;
const fileType = 12;
const fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';

// "Profile" as ERC 735 self-claims.
// See https://github.com/ethereum/EIPs/issues/735#issuecomment-450647097
const profile = {
  givenName: "John",
  familyName: "Doe",
  jobTitle: "Solidity developer",
  url: "https://johndoe.com",
  email: "john@doe.com",
  description: "I love building dApps"
}

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
    // 1. Generate asymetric encryption key RSA 2048.
    asymetricEncryptionKey = new NodeRSA({b: 2048});
    asymetricEncryptionPublickey = asymetricEncryptionKey.exportKey('public');
    asymetricEncryptionPrivatekey = asymetricEncryptionKey.exportKey('private');
    // 2. Encrypt symetric key passphrase with public asymetric key.
    symetricEncryptionEncryptedpassphrase = asymetricEncryptionKey.encrypt(symetricEncryptionPassphrase, 'base64');
    // 3. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Identity.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Identity.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // 4. Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(defaultUser, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    // 5. Deploy Foundation & register a Factory.
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
      web3.utils.asciiToHex(asymetricEncryptionPublickey),
      web3.utils.asciiToHex(symetricEncryptionEncryptedpassphrase),
      {from: factory}
    );
    assert(identity);
    await foundation.setInitialOwnerInFoundation(identity.address, user1, {from: factory});
    const user1key = web3.utils.keccak256(user1);
    await identity.addKey(user1key, 1, 1, {from: factory});
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
    assert.equal(web3.utils.hexToAscii(result[4]), asymetricEncryptionPublickey);
  });

  it('Anyone should get the encrypted symetric encryption passphrase, but only those who have User1\'s asymetric encryption private key should decipher it', async() => {
    const result = await identity.identityInformation({from: someone});
    const symKeyPassphraseEncrypted = web3.utils.hexToAscii(result[5]);
    assert.equal(symKeyPassphraseEncrypted, symetricEncryptionEncryptedpassphrase);
    // Regenerate the asymetric key from the private PEM, only User1 has it.
    const asymKey = new NodeRSA(asymetricEncryptionPrivatekey);
    const symKeyPassphrase = asymKey.decrypt(symKeyPassphraseEncrypted);
    assert.equal(symKeyPassphrase, symetricEncryptionPassphrase);
  });

  it('User1 should encrypt something with symetric key and someone who has the passphrase should be able to decipher it. This concerns for instance all encryptions of content available to Partner Members and users that bought his Vault access in the token. User1 can send his symetric key encrypted on the public encryption key of another user who has an Identity contract, as well', async() => {
    // 1. User1 encrypts some text.
    // First, derive key from passphrase. TODO: use salt, which one?
    const symetricEncryptionKey = crypto.scryptSync(symetricEncryptionPassphrase, '', 16);
    // Convert text to encrypt to bytes.
    const textBytes = aesjs.utils.utf8.toBytes(textToEncrypt);
    // Counter.
    const aesCtr = new aesjs.ModeOfOperation.ctr(symetricEncryptionKey, new aesjs.Counter(5));
    // Encrypt.
    const encryptedBytes = aesCtr.encrypt(textBytes);
    // To hex.
    const encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    // To blockchain.
    const bcEncryptedHex = '0x' + encryptedHex;
    // We will not write and read to BC here, because Identity has no storage to do this.
    // We should do it in Profile contract for instance but it's a bit a pain to init everything,
    // so we just test encryption and decryption here.
    // 2. User2 decrypts the text.
    // User2 has the passphrase, let's generate the key.
    const symetricEncryptionKey2 = crypto.scryptSync(symetricEncryptionPassphrase, '', 16);
    // Remove 0x from BC encrypted text.
    const encryptedHex2 = bcEncryptedHex.substr(2);
    // To bytes.
    const encryptedBytes2 = aesjs.utils.hex.toBytes(encryptedHex2);
    // Init counter.
    const aesCtr2 = new aesjs.ModeOfOperation.ctr(symetricEncryptionKey2, new aesjs.Counter(5));
    // Decrypt.
    const decryptedBytes2 = aesCtr2.decrypt(encryptedBytes2);
    const decryptedText2 = aesjs.utils.utf8.fromBytes(decryptedBytes2);
    assert.equal(decryptedText2, textToEncrypt);
  });

  it('User2 should be able to send an encrypted text, anyone should be able to retrieve it, but only User1 should decipher it', async() => {
    // Get asym pub key.
    const result1 = await identity.identityInformation({from: user2});
    const asymPubPem = web3.utils.hexToAscii(result1[4]);
    // Import pub key.
    const asymPubKey = new NodeRSA(asymPubPem);
    // Key must have public pair value only.
    assert(asymPubKey.isPublic(true));
    // Encrypt text.
    const encryptedText = asymPubKey.encrypt(textToEncrypt, 'base64');
    // Send text.
    const result2 = await identity.identityboxSendtext(
      textCategory,
      web3.utils.asciiToHex(encryptedText),
      {from: user2}
    );
    // Check event.
    truffleAssert.eventEmitted(result2, 'TextReceived', event => {
      return (
        event.sender == user2 && event.category == textCategory
      );
    });
    // User1 reads event and gets encrypted text.
    const event = result2.logs[0].args;
    const receivedEncryptedText = web3.utils.hexToAscii(event.text);
    // User1 regenerates the asymetric key from the private PEM he only has.
    const asymPrivKey = new NodeRSA(asymetricEncryptionPrivatekey);
    // User1 deciphers text.
    const decipheredText = asymPrivKey.decrypt(receivedEncryptedText);
    // Is it the original message?
    assert.equal(decipheredText, textToEncrypt);
    // Someone else tries to decipher and fails.
    try {
      asymPubKey.decrypt(receivedEncryptedText);
    } catch(err) {
      assert(true);
    }
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

  // Note: to fully test ClaimHolder, we also add signatures.
  // However in the UI we won't add signatures for self-claims,
  // because signing self-claims makes no sense.
  it('User1 should add one self-claim', async() => {
    const result = await identity.addClaim(
      erc735js.asciiToTopic('givenName'),
      1,
      user1,
      web3.utils.keccak256(identity.address, erc735js.asciiToTopic('givenName'), profile.givenName),
      web3.utils.asciiToHex(profile.givenName),
      'https://user1.com/about',
      {from: user1}
    );
    assert(result);
    truffleAssert.eventEmitted(result, 'ClaimAdded', (ev) => {
      return ev.claimId === web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName'));
    });
  });

  it('Anyone should retrieve claim IDs by topic and claimIDs should be deterministic', async() => {
    const result = await identity.getClaimIdsByTopic(erc735js.asciiToTopic('givenName'), {from: someone});
    assert.equal(result[0], web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName')));
  });

  it('Anyone should retrieve a claim by its ID', async() => {
    const claimId = web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName'));
    const result = await identity.getClaim(claimId, {from: someone});
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('givenName'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('givenName'), profile.givenName));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.givenName);
    assert.equal(result[5], 'https://user1.com/about');
  });

  it('User1 should remove a self-claim by its ID', async() => {
    const claimId = web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName'));
    const result = await identity.removeClaim(claimId, {from: user1});
    assert(result);
    truffleAssert.eventEmitted(result, 'ClaimRemoved', (ev) => {
      return ev.claimId === web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName'));
    });
  });

  it('User should not have a self-claim on this topic any more', async() => {
    const claimId = web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName'));
    const result = await identity.getClaim(claimId, {from: someone});
    assert.equal(result[0].toNumber(), 0);
    assert.equal(result[1].toNumber(), 0);
    assert.equal(result[2], '0x0000000000000000000000000000000000000000');
    assert.equal(result[3], '0x');
    assert.equal(result[4], '0x');
    assert.equal(result[5], '');
  });

  // Note: to fully test ClaimHolder, we also add signatures.
  // However in the UI we won't add signatures for self-claims,
  // because signing self-claims makes no sense.
  it('User1 should add self-claim with the addClaims function', async() => {
    // For one sig row we convert to hex and remove 0x
    const sigRow = web3.utils.keccak256(identity.address, erc735js.asciiToTopic('givenName'), profile.givenName).substr(2);
    // Serialized sig is concatenation of sig rows + we add again 0x in the beginning.
    const sig = '0x' + sigRow;
    // For one data row we convert to hex and remove 0x
    const dataRow = web3.utils.asciiToHex(profile.givenName).substr(2);
    // Serialized data is concatenation of data rows + we add again 0x in the beginning.
    const data = '0x' + dataRow;
    const result = await identity.addClaims(
      [
        erc735js.asciiToTopic('givenName')
      ],
      [
        user1
      ],
      sig,
      data,
      [
        profile.givenName.length,
      ],
      {from: user1}
    );
    assert(result)
  });

  it('Claim added with addClaims should have correct data', async() => {
    const claimId = web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName'));
    const result = await identity.getClaim(claimId);
    assert.equal(web3.utils.hexToAscii(result[4]), profile.givenName);
  });

  it('User1 should set his "Profile" with ERC 735 self-claims in 1 call to addClaims', async() => {
    // TODO picture
    const result = await identity.addClaims(
      [
        erc735js.asciiToTopic('givenName'),
        erc735js.asciiToTopic('familyName'),
        erc735js.asciiToTopic('jobTitle'),
        erc735js.asciiToTopic('url'),
        erc735js.asciiToTopic('email'),
        erc735js.asciiToTopic('description')
      ],
      [
        user1,
        user1,
        user1,
        user1,
        user1,
        user1
      ],
      '0x'
      +  web3.utils.keccak256(identity.address, erc735js.asciiToTopic('givenName'), profile.givenName).substr(2)
      +  web3.utils.keccak256(identity.address, erc735js.asciiToTopic('familyName'), profile.familyName).substr(2)
      +  web3.utils.keccak256(identity.address, erc735js.asciiToTopic('jobTitle'), profile.jobTitle).substr(2)
      +  web3.utils.keccak256(identity.address, erc735js.asciiToTopic('url'), profile.url).substr(2)
      +  web3.utils.keccak256(identity.address, erc735js.asciiToTopic('email'), profile.email).substr(2)
      +  web3.utils.keccak256(identity.address, erc735js.asciiToTopic('description'), profile.description).substr(2),
      '0x'
      + web3.utils.asciiToHex(profile.givenName).substr(2)
      + web3.utils.asciiToHex(profile.familyName).substr(2)
      + web3.utils.asciiToHex(profile.jobTitle).substr(2)
      + web3.utils.asciiToHex(profile.url).substr(2)
      + web3.utils.asciiToHex(profile.email).substr(2)
      + web3.utils.asciiToHex(profile.description).substr(2),
      [
        profile.givenName.length,
        profile.familyName.length,
        profile.jobTitle.length,
        profile.url.length,
        profile.email.length,
        profile.description.length
      ],
      {from: user1}
    );
    assert(result);
  });

  it('User1 self claims for his "Profile" should exist and have correct data', async() => {
    let result;

    result = await identity.getClaim(web3.utils.soliditySha3(user1, erc735js.asciiToTopic('givenName')));
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('givenName'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('givenName'), profile.givenName));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.givenName);
    assert.equal(result[5], '');

    result = await identity.getClaim(web3.utils.soliditySha3(user1, erc735js.asciiToTopic('familyName')));
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('familyName'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('familyName'), profile.familyName));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.familyName);
    assert.equal(result[5], '');

    result = await identity.getClaim(web3.utils.soliditySha3(user1, erc735js.asciiToTopic('jobTitle')));
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('jobTitle'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('jobTitle'), profile.jobTitle));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.jobTitle);
    assert.equal(result[5], '');

    result = await identity.getClaim(web3.utils.soliditySha3(user1, erc735js.asciiToTopic('url')));
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('url'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('url'), profile.url));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.url);
    assert.equal(result[5], '');

    result = await identity.getClaim(web3.utils.soliditySha3(user1, erc735js.asciiToTopic('email')));
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('email'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('email'), profile.email));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.email);
    assert.equal(result[5], '');

    result = await identity.getClaim(web3.utils.soliditySha3(user1, erc735js.asciiToTopic('description')));
    assert.equal(result[0].toNumber(), erc735js.asciiToTopic('description'));
    assert.equal(result[1].toNumber(), 1);
    assert.equal(result[2], user1);
    assert.equal(result[3], web3.utils.keccak256(identity.address, erc735js.asciiToTopic('description'), profile.description));
    assert.equal(web3.utils.hexToAscii(result[4]), profile.description);
    assert.equal(result[5], '');
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
