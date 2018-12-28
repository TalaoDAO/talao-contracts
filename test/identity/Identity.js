const crypto = require('crypto');
const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Identity = artifacts.require('Identity');

// "this string just fills a bytes32"
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const bytes16 = '0x74686973206973203136206279746573';
// String.
const string = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;
const symetricEncryptionKey = web3.utils.asciiToHex('This will have to be generated or chosen by user and encrypted');
const symetricEncryptionKeyAlgorithm = 1; // aes-256-ctr
const symetricEncryptionKeyAlgorithmNames = {
  1: 'aes-256-ctr'
};
const symetricEncryptionKeyLength = 256;
const privateEmail = 'private@email.com';
const privateMobile = '0123456789';

const symetricEncrypt = text => {
  const cipher = crypto.createCipher('aes-256-ctr', symetricEncryptionKey);
  let crypted = cipher.update(text, 'utf8', 'hex');
  crypted += cipher.final('hex');
  // Add 0x because BC wants it.
  return '0x' + crypted;
  return crypted;
}

const symetricDecrypt = text => {
  // Remove 0x BC wanted.
  text = text.substr(2);
  const decipher = crypto.createDecipher(symetricEncryptionKeyAlgorithmNames[1], symetricEncryptionKey);
  let dec = decipher.update(text, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

const encryptedPrivateEmail = symetricEncrypt(privateEmail);
const encryptedPrivateMobile = symetricEncrypt(privateMobile);

contract('Identity', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const factory = accounts[8];
  const someone = accounts[9];
  let token;
  let identity1, profile2;

  before(async () => {
    // Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new();
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address);
    claimHolderLibrary = await ClaimHolderLibrary.new();
    await Identity.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Identity.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(talaoOwner, 150000000000000000000);
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

  it('Factory should deploy contract Identity1 (category 1001), set owner and give ERC 725 Management key', async() => {
    identity1 = await Identity.new(
      foundation.address,
      token.address,
      1001,
      0,
      0,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(identity1);
    await foundation.setInitialOwnerInFoundation(identity1.address, user1, {from: factory});
    const user1key = web3.utils.keccak256(user1);
    await identity1.addKey(user1key, 1, 1, {from: factory});
  });

});
