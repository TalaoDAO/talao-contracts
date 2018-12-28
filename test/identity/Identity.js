const NodeRSA = require('node-rsa');
const crypto = require('crypto');
const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

const symetricEncrypt = text => {
  const cipher = crypto.createCipher('aes-256-ctr', symetricEncryptionKeyPassphrase);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  // Add 0x because BC wants it.
  return '0x' + crypted;
  return crypted;
}

const symetricDecrypt = text => {
  // Remove 0x BC wanted.
  text = text.substr(2);
  const decipher = crypto.createDecipher(symetricEncryptionKeyAlgorithmNames[1], symetricEncryptionKeyPassphrase);
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
const asymetricEncryptionKeyAlgorithm = 1; // RSA 2048 with defaults from https://github.com/rzcoder/node-rsa
const asymetricEncryptionKeyLength = 1; // TODO in theory we do not need to store this any more on the BC, we can "consider" the algo to include the length and various options used in reference librairies.
let asymetricEncryptionKey, asymetricEncryptionKeyPublic, asymetricEncryptionKeyPrivate;

// Symetric encryption key.
const symetricEncryptionKeyPassphrase = 'This is the passphrase for the symetric key I chose at contract creation.';
let symetricEncryptionKeyPassphraseEncrypted;
const symetricEncryptionKeyAlgorithm = 1; // aes-256-ctr
const symetricEncryptionKeyAlgorithmNames = {
  1: 'aes-256-ctr'
};
const symetricEncryptionKeyLength = 256;

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
    asymetricEncryptionKeyPublic = asymetricEncryptionKey.exportKey('public');
    asymetricEncryptionKeyPrivate = asymetricEncryptionKey.exportKey('private');
    // Encrypt symetric key with public asymetric key.
    symetricEncryptionKeyPassphraseEncrypted = asymetricEncryptionKey.encrypt(symetricEncryptionKeyPassphrase, 'base64');
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
      asymetricEncryptionKeyAlgorithm,
      asymetricEncryptionKeyLength,
      0,
      0,
      web3.utils.asciiToHex(asymetricEncryptionKeyPublic),
      '0x',
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

  it('Contract category should be Freelancer', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[1].toNumber(), category);
  });

  it('Asymetric encryption algorithm should be RSA 2048', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(result[2].toNumber(), asymetricEncryptionKeyAlgorithm);
  });

  // TODO remove asym length

  it('Anyone should be able to get the public asymetric encryption key', async() => {
    const result = await identity.identityInformation({from: someone});
    assert.equal(web3.utils.hexToAscii(result[6]), asymetricEncryptionKeyPublic);
  });

});
