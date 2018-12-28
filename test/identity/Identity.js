const NodeRSA = require('node-rsa');
const pbkdf2 = require('pbkdf2');
const crypto = require('crypto');
const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

const symetricEncrypt = text => {
  const cipher = crypto.createCipher('aes-256-ctr', symetricEncryptionPassphrase);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  // Add 0x because BC wants it.
  return '0x' + crypted;
  return crypted;
}

const symetricDecrypt = text => {
  // Remove 0x BC wanted.
  text = text.substr(2);
  const decipher = crypto.createDecipher(symetricEncryptionAlgorithmNames[1], symetricEncryptionPassphrase);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

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
let symetricEncryptionEncryptedpassphrase;
const symetricEncryptionAlgorithm = 1; // aes-256-ctr

// Data samples.
const category = 1001;
const privateEmail = 'private@email.com';
const privateMobile = '0123456789';
const encryptedPrivateEmail = symetricEncrypt(privateEmail);
const encryptedPrivateMobile = symetricEncrypt(privateMobile);

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
    // Generate asymetric encryption key RSA 2048.
    asymetricEncryptionKey = new NodeRSA({b: 2048});
    asymetricEncryptionPublickey = asymetricEncryptionKey.exportKey('public');
    asymetricEncryptionPrivatekey = asymetricEncryptionKey.exportKey('private');
    // Encrypt symetric key passphrase with public asymetric key.
    symetricEncryptionEncryptedpassphrase = asymetricEncryptionKey.encrypt(symetricEncryptionPassphrase, 'base64');
    // Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Identity.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Identity.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(defaultUser, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    // Deploy Foundation & register a Factory.
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

  it('Anyone should get symetric encryption algorithm: AES 256', async() => {
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

  // TODO Filebox

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
