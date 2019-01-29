const web3 = require('web3')
const truffleAssert = require('truffle-assertions')

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol')
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol')
const TalaoToken = artifacts.require('TalaoToken')
const Foundation = artifacts.require('Foundation')
const Documents = artifacts.require('DocumentsTest')

// Contract instances.
let token, foundation, documents1

// Sample data.
const bytes32 = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332'
const otherBytes32 = '0x8468697320737472696e67206a7573742066696c6c7320612062797465733332'
const docTypeCertificate = 60000
const docTypeExperience = 50000
const docType = 10000
const otherDocType = 20000
const docTypeVersion = 1
const otherDocTypeVersion = 2
const fileChecksum = bytes32
const otherFileChecksum = otherBytes32
const fileLocationEngine = 1
const otherFileLocationEngine = 2
const fileLocationHash = bytes32
const otherFileLocationHash = otherBytes32
const encrypted = true
const otherEncrypted = false

contract('Documents', async (accounts) => {
  const defaultUser = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]
  const user3 = accounts[3]
  const user4 = accounts[4]
  const contract5 = accounts[5]
  const user6 = accounts[6]
  const factory = accounts[8]
  const someone = accounts[9]

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new()
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address)
    claimHolderLibrary = await ClaimHolderLibrary.new()
    await Documents.link(KeyHolderLibrary, keyHolderLibrary.address)
    await Documents.link(ClaimHolderLibrary, claimHolderLibrary.address)
    // 2. Deploy Talao token, set it, transfer TALAOs and open Vault access.
    token = await TalaoToken.new()
    await token.mint(defaultUser, 150000000000000000000)
    await token.finishMinting()
    await token.setVaultDeposit(100)
    await token.transfer(user1, 1000)
    await token.transfer(user2, 1000)
    await token.transfer(user3, 1000)
    await token.createVaultAccess(10, { from: user1 })
    await token.createVaultAccess(0, { from: user2 })
    await token.createVaultAccess(50, { from: user3 })
    // 3. Deploy Foundation & register a Factory.
    foundation = await Foundation.new()
    await foundation.addFactory(factory)
  })

  // Simple init for initial owners, already tested in OwnableInFoundation.js
  it('Factory should deploy Documents1 (category 1001 Freelance), Documents2 (category 2001 Marketplace), set initial owners to User1 and User2 and give them ERC 725 Management key', async() => {
    // Documents1
    documents1 = await Documents.new(
      foundation.address,
      token.address,
      1001,
      1,
      1,
      '0x11',
      '0x12',
      '0x13',
      {from: factory}
    )
    assert(documents1)
    await foundation.setInitialOwnerInFoundation(documents1.address, user1, {from: factory})
    await documents1.addKey(web3.utils.keccak256(user1), 1, 1, {from: factory})
    // Documents2.
    documents2 = await Documents.new(
      foundation.address,
      token.address,
      2001,
      1,
      1,
      '0x21',
      '0x22',
      '0x23',
      {from: factory}
    )
    assert(documents2)
    await foundation.setInitialOwnerInFoundation(documents2.address, user2, {from: factory})
    await documents2.addKey(web3.utils.keccak256(user2), 1, 1, {from: factory})
  })

  it('User1 should add a document ID = 1', async() => {
    // index = []
    const result = await documents1.createDocument(
      docType,
      docTypeVersion,
      fileChecksum,
      fileLocationEngine,
      fileLocationHash,
      encrypted,
      {from: user1}
    )
    // index = [1]
    assert(result)
    truffleAssert.eventEmitted(result, 'DocumentAdded')
  })

  it('In Document1, User1 should be able get documents1 index, but not someone else', async() => {
    const result1 = await documents1.getDocuments({from: user1})
    assert.equal(result1.toString(), 1)
    const result2 = await truffleAssert.fails(
      documents1.getDocuments({ from: someone })
    )
    assert(!result2)
  })

  it('In Document1, User1 should be able get document of ID 1, but not someone else', async() => {
    const result1 = await documents1.getDocument(1, {from: user1})
    assert.equal(
      result1.toString(),
      [
        docType,
        docTypeVersion,
        user1,
        fileChecksum,
        fileLocationEngine,
        fileLocationHash,
        encrypted,
        0
      ]
    )
    const result2 = await truffleAssert.fails(
      documents1.getDocument(1, { from: someone })
    )
    assert(!result2)
  })

  it('User1 should add a new document ID = 2', async() => {
    // index = [1]
    const result = await documents1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    )
    // index = [1,2]
    assert(result)
  })

  it('User1 should add a new experience ID = 3', async() => {
    //index = [1,2]
    const result = await documents1.createDocument(
      docTypeExperience,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    )
    // index = [1,2,3]
    assert(result)
  })

  it('User1 should add a new experience ID = 4', async() => {
    // index = [1,2,3]
    const result = await documents1.createDocument(
      docTypeExperience,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    )
    // index = [1,2,3,4]
    assert(result)
  })

  it('User1 should delete document of ID = 2', async() => {
    // index = [1,2,3,4]
    const result = await documents1.deleteDocument(2, {from: user1})
    // index = [1,4,3] (see Documents.sol)
    assert(result)
    truffleAssert.eventEmitted(result, 'DocumentRemoved')
  })

  it('getDocuments should return the correct array of doc IDs [1, 4, 3]', async() => {
    const result = await documents1.getDocuments({from: user1})
    assert.equal(
      result.toString(),
      '1,4,3'
    )
  })

  it('User1 should "update" the experience ID = 1, index[0]. In fact this will delete the experience and add a new experience ID=5.', async() => {
    // index = [1,4,3]
    const result = await documents1.updateDocument(
      1,
      docTypeExperience,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user1}
    )
    // delete => index = [3,4]
    // create => index = [3,4,5]
    assert(result)
    truffleAssert.eventEmitted(result, 'DocumentAdded')
    truffleAssert.eventEmitted(result, 'DocumentRemoved')
  })

  it('getDocuments should return the correct array of doc IDs [3, 4, 5]', async() => {
    const result = await documents1.getDocuments({from: user1})
    assert.equal(
      result.toString(),
      '3,4,5'
    )
  })

  it('User1 gives key to User6 for profile & documents1 (ERC 725 20002)', async() => {
    const user6key = web3.utils.keccak256(user6)
    const result = await documents1.addKey(user6key, 20002, 1, {from: user1})
    assert(result)
  })

  it('User6 should add a new document ID6', async() => {
    // index = [3,4,5]
    const result = await documents1.createDocument(
      otherDocType,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      {from: user6}
    )
    // index = [3,4,5,6]
    assert(result)
  })

  it('User1 should ask Workspace2 in partnership && User2 should accept', async() => {
    await documents1.requestPartnership(
      documents2.address,
      '0x91',
      { from: user1 }
    )
    await documents2.authorizePartnership(
      documents1.address,
      '0x92',
      { from: user2 }
    )
    const result1 = await documents2.isPartnershipMember({ from: user1 })
    assert(result1)
    const result2 = await documents1.isPartnershipMember({ from: user2 })
    assert(result2)
  })

  it('User2 (Marketplace owner) should issue a Certificate ID 7 in User1\'s contract (Freelance), related to experience ID 3', async() => {
    // index = [3,4,5,6]
    const result = await documents1.issueCertificate(
      docTypeCertificate,
      docTypeVersion,
      fileChecksum,
      fileLocationEngine,
      fileLocationHash,
      encrypted,
      3,
      {from: user2}
    )
    // index = [3,4,5,6] (7 not added because it's a certificate)
    assert(result)
    truffleAssert.eventEmitted(result, 'CertificateIssued')
  })

  it('getDocuments should not return the certificate, yet', async() => {
    const result = await documents1.getDocuments({from: user1})
    assert.equal(
      result.toString(),
      '3,4,5,6'
    )
  })

  it('User1 should accept the certificate', async() => {
    // index = [3,4,5,6]
    const result1 = await documents1.acceptCertificate(7, {from: user1})
    // accept =
    // 1) publish and add to index => index = [3,4,5,6,7]
    // 2) remove experience 3 => index = [7,4,5,6]
    assert(result1)
    truffleAssert.eventEmitted(result1, 'CertificateAccepted')
    truffleAssert.eventEmitted(result1, 'DocumentRemoved')
    const result2 = await documents1.getDocuments({from: user1})
    assert.equal(
      result2.toString(),
      '7,4,5,6'
    )
  })

  it('User2 should add User3 as a member of his contract and User3 (Marketplace manager) should issue a document ID8 in User1\'s contract (Freelance) corresponding to experience 4', async() => {
    await foundation.addMember(user3, {from: user2})
    // index = [7,4,5,6]
    const result = await documents1.issueCertificate(
      docTypeCertificate,
      otherDocTypeVersion,
      otherFileChecksum,
      otherFileLocationEngine,
      otherFileLocationHash,
      otherEncrypted,
      4,
      {from: user3}
    )
    // index = [7,4,5,6] (ID 8 not added, certificate)
    assert(result)
  })

  it('User4 has no right to issue a document in User1\'s contract, corresponding to experience 5', async() => {
    truffleAssert.fails(
      documents1.issueCertificate(
        docTypeCertificate,
        otherDocTypeVersion,
        otherFileChecksum,
        otherFileLocationEngine,
        otherFileLocationHash,
        otherEncrypted,
        5,
        {from: user4}
      )
    )
  })

  it('User1 should remove issued certificate ID7 and getDocuments should return the correct index', async() => {
    // index = [7,4,5,6]
    await documents1.deleteDocument(7, {from: user1})
    // index = [6,4,5]
    const result = await documents1.getDocuments({from: user1})
    assert.equal(
      result.toString(),
      '6,4,5'
    )
  })

  it('User1 adds an ERC 725 20001 key "Reader" to Contract5. Contract5 should be able to read its "private" content', async() => {
    await documents1.addKey(web3.utils.keccak256(contract5), 20001, 1, {from: user1})
    const result1 = await documents1.isReader({from: contract5})
    assert(result1)
    const result2 = await documents1.getDocuments({from: contract5})
    assert.equal(
      result2.toString(),
      '6,4,5'
    )
    const result3 = await documents1.getDocument(5, {from: contract5})
    assert.equal(
      result3.toString(),
      [
        docTypeExperience,
        otherDocTypeVersion,
        user1,
        otherFileChecksum,
        otherFileLocationEngine,
        otherFileLocationHash,
        otherEncrypted,
        0
      ]
    )
  })

})
