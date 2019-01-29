const web3 = require('web3')
const truffleAssert = require('truffle-assertions')

// Contract artifacts.
const KeyHolderLibrary = artifacts.require('./identity/KeyHolderLibrary.sol')
const ClaimHolderLibrary = artifacts.require('./identity/ClaimHolderLibrary.sol')
const TalaoToken = artifacts.require('TalaoToken')
const Foundation = artifacts.require('Foundation')
const Profile = artifacts.require('ProfileTest')

// Contract instances.
let token, foundation, profile

// Sample data.
const privateEmail = '0x71'
const privateMobile = '0x81'

contract('Profile', async (accounts) => {
  const defaultUser = accounts[0]
  const user1 = accounts[1]
  const user2 = accounts[2]
  const user3 = accounts[3]
  const user4 = accounts[4]
  const factory = accounts[8]
  const someone = accounts[9]

  // Init.
  before(async () => {
    // 1. Deploy & link librairies.
    keyHolderLibrary = await KeyHolderLibrary.new()
    await ClaimHolderLibrary.link(KeyHolderLibrary, keyHolderLibrary.address)
    claimHolderLibrary = await ClaimHolderLibrary.new()
    await Profile.link(KeyHolderLibrary, keyHolderLibrary.address)
    await Profile.link(ClaimHolderLibrary, claimHolderLibrary.address)
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
  it('Factory should deploy Profile1 (category 1001), set initial owner and give him ERC 725 Management key', async() => {
    profile = await Profile.new(
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
    assert(profile)
    await foundation.setInitialOwnerInFoundation(profile.address, user1, {from: factory})
    const user1key = web3.utils.keccak256(user1)
    await profile.addKey(user1key, 1, 1, {from: factory})
  })

  // Public profile managed as ERC 735 self-claims.
  // See '../identity/ClaimHolder.js'

  it('User1 should set his private profile', async() => {
    const result = await profile.setPrivateProfile(
      privateEmail,
      privateMobile,
      {from:user1}
    )
    assert(result)
  })

  it('In profile, user1 should get his private profile', async() => {
    const result = await profile.getPrivateProfile({from:user1})
    assert.equal(result[0], privateEmail)
    assert.equal(result[1], privateMobile)
  })

  it('In profile, user3 should not be able to get private profile', async() => {
    const result = await truffleAssert.fails(
      profile.getPrivateProfile({ from: user3 })
    )
    assert(!result)
  })

  it('user3 buys Vault access to user1 in the token, and then user3 should be able to get private profile in profile', async() => {
    await token.getVaultAccess(user1, {from:user3})
    const result = await profile.getPrivateProfile({from:user3})
    assert.equal(result[0], privateEmail)
    assert.equal(result[1], privateMobile)
  })

  it('User1 gives key to User4 for private profile & documents (ERC 725 20002)', async() => {
    const user4key = web3.utils.keccak256(user4)
    const result = await profile.addKey(user4key, 20002, 1, {from: user1})
    assert(result)
  })

  it('User4 changes private profile', async() => {
    const result = await profile.setPrivateProfile(
      privateEmail,
      privateMobile,
      {from:user4}
    )
    assert(result)
  })

})
