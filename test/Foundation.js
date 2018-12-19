const truffleAssert = require('truffle-assertions');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const WorkspaceFactory = artifacts.require('WorkspaceFactory');
const Workspace = artifacts.require('Workspace');

// "this string just fills a bytes32"
let name1, name2, tagline, url, publicEmail, privateEmail, fileHash;
name1 = name2 = tagline = url = publicEmail = privateEmail = fileHash = '0x7468697320737472696e67206a7573742066696c6c7320612062797465733332';
// "this is 16 bytes"
const mobile = '0x74686973206973203136206279746573';
// String.
const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aliquam tristique quam iaculis quam accumsan, in sollicitudin arcu pulvinar. Morbi malesuada metus a hendrerit tempor. Quisque egestas eros tellus. Maecenas in nisi eu orci tempor accumsan quis non sapien. Morbi nec efficitur leo. Aliquam porta mauris in eleifend faucibus. Vestibulum pulvinar quis lorem tempor vestibulum. Proin semper mattis commodo. Nam sagittis maximus elementum. Integer in porta orci. Donec eu porta odio, sit amet rutrum urna.';
const fileEngine = 1;

contract('Foundation', async (accounts) => {
  const talaoOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const user3 = accounts[3];
  const user4 = accounts[4];
  const user5 = accounts[5];
  const someone = accounts[9];
  let token;
  let foundation;
  let factory;
  let finalContract1, finalContract3, finalContract4;
  let finalContract1Address, finalContract3Address, finalContract4Address;
  let result;

  it('Should init token', async() => {
    token = await TalaoToken.new();
    await token.mint(talaoOwner, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.transfer(user3, 1000);
    await token.transfer(user4, 1000);
    await token.createVaultAccess(10, { from: user1 });
    await token.createVaultAccess(10, { from: user3 });
    await token.createVaultAccess(10, { from: user4 });
  });

  it('Should deploy Foundation contract', async() => {
    foundation = await Foundation.new(token.address);
    assert(foundation);
  });

  it('Should deploy a factory contract', async() => {
    factory = await WorkspaceFactory.new(foundation.address, token.address);
    assert(factory);
  });

  it('Should add the factory to Foundation', async() => {
    result = await foundation.addFactory(factory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryAdded');
  });

  it('Through the factory, User1 should create a final contract of category1 (Freelancer)', async() => {
    result = await factory.createWorkspace(
      1,
      name1,
      name2,
      tagline,
      url,
      publicEmail,
      fileHash,
      fileEngine,
      description,
      privateEmail,
      mobile,
      {from: user1}
    );
    assert(result);
  });

  it('No events were emitted, but we can now ask the contract address to the Foundation accountsToContrats the contract address. It should be consistent with contractToAccounts', async() => {
    finalContract1Address = await foundation.accountsToContracts(user1, {from: someone});
    result = await foundation.contractsToAccounts(finalContract1Address, {from: someone});
    assert.equal(result.toString(), user1)
  });

  it('Should load final contract', async() => {
    finalContract1 = await Workspace.at(finalContract1Address);
    assert(finalContract1);
  });

  it('Anyone should be able to read public data from final contract', async() => {
    result = await finalContract1.publicProfile({from: someone});
    assert.equal(
      result.toString(),
      [
        name1,
        name2,
        tagline,
        url,
        publicEmail,
        fileHash,
        fileEngine,
        description,
      ]
    );
  });

  it('User2 should not have access to private profile', async() => {
    result = await truffleAssert.fails(
      finalContract1.getPrivateProfile({from: user2})
    );
    assert(!result);
  });

  it('User2 should buy access to User1 in token', async() =>{
    result = await token.getVaultAccess(user1, {from: user2});
    assert(result);
  });

  it('User2 should have access to private profile', async() => {
    result = await finalContract1.getPrivateProfile({from: user2});
    assert.equal(
      result.toString(),
      [
        privateEmail,
        mobile
      ]
    );
  });

  it('Through the factory, User3 should create a final contract of category 2 (Marketplace)', async() => {
    result = await factory.createWorkspace(
      2,
      name1,
      name2,
      tagline,
      url,
      publicEmail,
      fileHash,
      fileEngine,
      description,
      privateEmail,
      mobile,
      {from: user3}
    );
    assert(result);
    finalContract3Address = await foundation.accountsToContracts(user3, {from: someone});
    finalContract3 = await Workspace.at(finalContract3Address);
    assert(finalContract3);
  });

  it('User3 should not have access to private profile of User1\'s contract', async() => {
    result = await truffleAssert.fails(
      finalContract1.getPrivateProfile({from: user3})
    );
    assert(!result);
  });

  it('User3 should request partnership of his contract with User1\'s contract', async() => {
    result = await finalContract3.requestPartnership(finalContract1.address, { from: user3 });
    assert(result);
  });

  it('User1 should accept partnership of his contract with User3\'s contract', async() => {
    result = await finalContract1.authorizePartnership(finalContract3.address, { from: user1 });
    assert(result);
  });

  it('User3 should have access to private profile of User1\'s contract', async() => {
    result = await finalContract1.getPrivateProfile({from: user3});
    assert.equal(
      result.toString(),
      [
        privateEmail,
        mobile
      ]
    );
  });

  it('User4 should not have access to private profile of User1\'s contract', async() => {
    result = await truffleAssert.fails(
      finalContract1.getPrivateProfile({from: user4})
    );
    assert(!result);
  });

  it('User3 should transfer his contract to User4', async() => {
    await foundation.transferOwnershipInFoundation(finalContract3.address, user4, { from: user3 });
    result = await foundation.contractsToAccounts(finalContract3.address, {from: someone});
    assert.equal(result, user4);
  });

  it('User4 should have access to private profile of User1\'s contract', async() => {
    result = await finalContract1.getPrivateProfile({from: user4});
    assert.equal(
      result.toString(),
      [
        privateEmail,
        mobile
      ]
    );
  });

  it('User3 should not have access to private profile of User1\'s contract', async() => {
    result = await truffleAssert.fails(
      finalContract1.getPrivateProfile({from: user3})
    );
    assert(!result);
  });

  it('User4 should renounce to ownership of his contract in the Foundation', async() => {
    result = await foundation.renounceOwnershipInFoundation(finalContract3.address, {from: user4});
    assert(result);
  });

  it('User4 should be able to create a new contract finalContract4', async() => {
    result = await factory.createWorkspace(
      2,
      name1,
      name2,
      tagline,
      url,
      publicEmail,
      fileHash,
      fileEngine,
      description,
      privateEmail,
      mobile,
      {from: user4}
    );
    assert(result);
  });

  it('finalContract4 should be owned by User4', async() => {
    finalContract4Address = await foundation.accountsToContracts(user4, {from: someone});
    result = await foundation.contractsToAccounts(finalContract4Address, {from: someone});
    assert.equal(result.toString(), user4)
  });

  it('Should load finalContract4', async() => {
    finalContract4 = await Workspace.at(finalContract4Address);
    assert(finalContract4);
  });

  it('Talao owner should remove the Factory in the Foundation', async() => {
    result = await foundation.removeFactory(factory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FactoryRemoved');
  });

  it('User5 should fail to create a contract', async() => {
    result = await truffleAssert.fails(
      factory.createWorkspace(
        2,
        name1,
        name2,
        tagline,
        url,
        publicEmail,
        fileHash,
        fileEngine,
        description,
        privateEmail,
        mobile,
        {from: user5}
      )
    );
    assert(!result);
  });

});
