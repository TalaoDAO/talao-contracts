const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol');
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const Workspace = artifacts.require('Workspace');
const WorkspaceV2 = artifacts.require('WorkspaceV2');

// Contract instances.
let token, foundation, workspace1, workspaceV2;

// Sample data.
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
const otherBytes32 = '0x8468697320737472696e67206a7573742066696c6c7320612062797465733332';
const issuedDocType = 1; const docType = 2; const otherDocType = 3;
const docTypeVersion = 1; const otherDocTypeVersion = 2;
const fileChecksum = bytes32; const otherFileChecksum = otherBytes32;
const fileLocationEngine = 1; const otherFileLocationEngine = 2;
const fileLocationHash = bytes32; const otherFileLocationHash = otherBytes32;
const encrypted = true; const otherEncrypted = false;

contract('WorkspaceV2', async (accounts) => {
  const defaultUser = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const factory = accounts[7];
  const factory2 = accounts[8];
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
    await token.transfer(user1, 1000);
    await token.createVaultAccess(10, { from: user1 });
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new();
    await foundation.addFactory(factory);
  });

  it('Factory should deploy Workspace1, set initial owner to User1 and give him ERC 725 Management key', async() => {
    // Workspace1
    workspace1 = await Workspace.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      {from: factory}
    );
    assert(workspace1);
    await foundation.setInitialOwnerInFoundation(workspace1.address, user1, {from: factory});
    await workspace1.addKey(web3.utils.keccak256(user1), 1, 1, {from: factory});
  });

  it('User1 should add a document ID = 1, index[0]', async() => {
    const result = await workspace1.createDocument(
      docType,
      docTypeVersion,
      fileChecksum,
      fileLocationEngine,
      fileLocationHash,
      encrypted,
      {from: user1}
    );
    assert(result);
  });

  it('User1 should add a new document ID = 2, index[1]', async() => {
    const result = await workspace1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    );
    assert(result);
  });

  it('Talao Owner should add Factory2 to Foundation', async() => {
    const result = await foundation.addFactory(factory2, {from: defaultUser});
    assert(result);
  });

  it('Factory2 should deploy a WorkspaceV2', async() => {
    workspaceV2 = await WorkspaceV2.new({from: factory2});
    assert(workspaceV2);
  });

  it('In his old contract, User1 adds an ERC 725 20001 key "Reader" for WorkspaceV2', async() => {
    await workspace1.addKey(web3.utils.keccak256(workspaceV2.address), 20001, 1, {from: user1});
    const result = await workspace1.isReader({from: workspaceV2.address});
    assert(result);
  });

  it('Factory2 should import all documents from old gen workspace to new gen Workspace', async() => {
    const result = await workspaceV2.importDocuments(workspace1.address, {from: factory2});
    assert(result);
  });

  it('Factory2 should transfer new gen Workspace to User1', async() => {
    const result = await workspaceV2.transferOwnership(user1, {from: factory2});
    assert(result);
  });

  it('User1 should destroy his old Workspace', async() => {
    const result = await workspace1.destroyWorkspace({from: user1})
    assert(result);
  });

  it('Factory2 should transfer ownership in Foundation of new gen Workspace to User1', async() => {
    const result = await foundation.setInitialOwnerInFoundation(workspaceV2.address, user1, {from: factory2});
    assert(result);
  });

  it('New gen Workspace should contain the imported documents index', async() => {
    const result = await workspaceV2.getDocuments();
    assert.equal(
      result.toString(),
      [
        fileChecksum,
        otherFileChecksum
      ]
    );
  });

  it('New gen Workspace should have correct data for doc ID = 1', async() => {
    const result = await workspaceV2.getDocument(fileChecksum);
    assert.equal(
      result.toString(),
      [
        docType,
        user1,
        fileLocationEngine,
        fileLocationHash
      ]
    );
  });

});
