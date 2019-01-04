const web3 = require('web3');
const truffleAssert = require('truffle-assertions');
const truffleCost = require('truffle-cost');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Workspace = artifacts.require('Workspace');
const Service1 = artifacts.require('Service1');

// Contract instances.
let token, foundation, mpp1, mpp2, freelance1, freelance2, service1;

// Events.
let freelancer3events, freelancer4events;

contract('Service1', async (accounts) => {
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
    await Workspace.link(KeyHolderLibrary, keyHolderLibrary.address);
    await Workspace.link(ClaimHolderLibrary, claimHolderLibrary.address);
    // 2. Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new();
    await token.mint(defaultUser, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1100);
    await token.transfer(user2, 100100);
    await token.transfer(user3, 1000);
    await token.transfer(user4, 1000);
    await token.createVaultAccess(0, { from: user1 });
    await token.createVaultAccess(0, { from: user2 });
    await token.createVaultAccess(100, { from: user3 });
    await token.createVaultAccess(100, { from: user4 });
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  it('Factory should deploy MPP1, MPP2, Freelance3 and Freelance4, set initial owners to User1, User2, User3 and User4 and give them ERC 725 Management key', async() => {
    // MPP1
    mpp1 = await Workspace.new(
      foundation.address,
      token.address,
      2001,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(mpp1);
    await foundation.setInitialOwnerInFoundation(mpp1.address, user1, {from: factory});
    await mpp1.addKey(web3.utils.keccak256(user1), 1, 1, {from: factory});
    // MPP2
    mpp2 = await Workspace.new(
      foundation.address,
      token.address,
      2001,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(mpp2);
    await foundation.setInitialOwnerInFoundation(mpp2.address, user2, {from: factory});
    await mpp2.addKey(web3.utils.keccak256(user2), 1, 1, {from: factory});
    // Freelance3
    freelance3 = await Workspace.new(
      foundation.address,
      token.address,
      1001,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(freelance3);
    await foundation.setInitialOwnerInFoundation(freelance3.address, user3, {from: factory});
    await freelance3.addKey(web3.utils.keccak256(user3), 1, 1, {from: factory});
    freelancer3events = freelance3.allEvents({fromBlock: 0, toBlock: 'latest'});
    // Freelance4
    freelance4 = await Workspace.new(
      foundation.address,
      token.address,
      1001,
      0,
      0,
      '0x',
      '0x',
      {from: factory}
    );
    assert(freelance4);
    await foundation.setInitialOwnerInFoundation(freelance4.address, user4, {from: factory});
    await freelance4.addKey(web3.utils.keccak256(user4), 1, 1, {from: factory});
    freelancer4events = freelance4.allEvents({fromBlock: 0, toBlock: 'latest'});
  });

  it('MPP1 should become partner with Freelance3 and Freelance4', async() => {
    await mpp1.requestPartnership(
      freelance3.address,
      '0x91',
      { from: user1 }
    );
    await freelance3.authorizePartnership(
      mpp1.address,
      '0x93',
      { from: user3 }
    );
    await mpp1.requestPartnership(
      freelance4.address,
      '0x91',
      { from: user1 }
    );
    await freelance4.authorizePartnership(
      mpp1.address,
      '0x94',
      { from: user4 }
    );
    const result1 = await mpp1.isPartnershipMember({ from: user3 });
    assert(result1);
    const result2 = await mpp1.isPartnershipMember({ from: user4 });
    assert(result2);
  });

  it('User1 should create Service1 with price of 10000 Talao and grant him ERC 725 20003 key on MPP1', async() => {
    service1 = await Service1.new(
      token.address,
      mpp1.address,
      10000,
      {from: user1}
    );
    assert(service1);
    await mpp1.addKey(web3.utils.keccak256(service1.address), 20003, 1, {from: user1});
    const result = await mpp1.keyHasPurpose(web3.utils.keccak256(service1.address), 20003);
    assert(result);
  });

  it('User2 should check that Service1 is ready', async() => {
    const result = await service1.isServiceReady();
    assert(result);
  });

  it('User2 should buy MPP1\'s Service1 with a message: "Hi dear freelancers of MPP1!"', async() => {
    const result = await token.approveAndCall(
      service1.address,
      10000,
      web3.utils.asciiToHex('Hi dear freelancers of MPP1!'),
      {from: user2}
    );
    assert(result);
  });

  it('User2 should have spent 10000 TALAO', async() => {
    const result = await token.balanceOf(user2);
    assert.equal(result.toNumber(), 90000);
  });

  it('User1 should have gained 10000 TALAO', async() => {
    const result = await token.balanceOf(user1);
    assert.equal(result.toNumber(), 11000);
  });

  it('User3 should have received MPP2\'s message', async() => {
    freelancer3events.get((errors, logs) => {
      assert.equal(logs[5].event, 'TextReceived');
      assert.equal(logs[5].args.sender, service1.address);
      assert.equal(logs[5].args.category.toNumber(), 100000);
      assert.equal(web3.utils.hexToAscii(logs[5].args.text), 'Hi dear freelancers of MPP1!');
    });
  });

  it('User4 should have received MPP2\'s message', async() => {
    freelancer4events.get((errors, logs) => {
      assert.equal(logs[5].event, 'TextReceived');
      assert.equal(logs[5].args.sender, service1.address);
      assert.equal(logs[5].args.category.toNumber(), 100000);
      assert.equal(web3.utils.hexToAscii(logs[5].args.text), 'Hi dear freelancers of MPP1!');
    });
  });

});
