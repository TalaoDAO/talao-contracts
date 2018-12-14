const truffleAssert = require('truffle-assertions');
const TalaoToken = artifacts.require('TalaoToken');
const Foundation = artifacts.require('Foundation');
const WorkspaceFoundationFactory = artifacts.require('WorkspaceFoundationFactory');
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
  const someone = accounts[3];
  let token;
  let foundation;
  let factory;
  let finalContract;
  let finalContractAddress;
  let result;

  it('Should init token', async() => {
    token = await TalaoToken.new();
    await token.mint(talaoOwner, 150000000000000000000);
    await token.finishMinting();
    await token.setVaultDeposit(100);
    await token.transfer(user1, 1000);
    await token.transfer(user2, 1000);
    await token.createVaultAccess(10, { from: user1 });
  });

  it('Should deploy Foundation contract', async() => {
    foundation = await Foundation.new(token.address);
    assert(foundation);
  });

  it('Should deploy a factory contract', async() => {
    factory = await WorkspaceFoundationFactory.new(token.address, foundation.address);
    assert(factory);
  });

  it('Should add the factory to Foundation', async() => {
    result = await foundation.addFoundationFactory(factory.address);
    assert(result);
    truffleAssert.eventEmitted(result, 'FoundationFactoryAdded');
  });

  it('Through the factory, User1 should create a final contract and register its owner account to contract relationship in Foundation', async() => {
    result = await factory.createWorkspace(
      3,
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
    finalContractAddress = result.logs[0].address;
    assert(finalContractAddress);
  });

  it('Foundation should have the account of User1 to his contract address relationship', async() => {
    result = await foundation.foundationAccounts(user1, {from: someone});
    assert.equal(result.toString(), finalContractAddress)
  });

  it('Should load final contract', async() => {
    finalContract = await Workspace.at(finalContractAddress);
    assert(finalContract);
  })

  it('Final contract should work and be owned by User', async() => {
    result = await finalContract.owner({from: someone});
    assert.equal(result.toString(), user1);
  });

  it('User2 should not have access to private profile', async() => {
    result = await truffleAssert.fails(
      finalContract.getPrivateProfile({from: user2})
    );
    assert(!result);
  });

  it('User2 should buy access to User1 in token', async() =>{
    result = await token.getVaultAccess(user1, {from: user2});
    assert(result);
  });

  it('User2 should have access to private profile', async() => {
    result = await finalContract.getPrivateProfile({from: user2});
    assert.equal(
      result.toString(),
      [
        privateEmail,
        mobile
      ]
    );
  })

});
