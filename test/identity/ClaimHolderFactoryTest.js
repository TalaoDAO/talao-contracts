const ClaimHolderFactoryTest = artifacts.require('ClaimHolderFactoryTest');

contract('ClaimHolderFactoryTest', async (accounts) => {
  const defaultOwner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];
  const someone = accounts[9];
  let factory;
  let claimHolderTest;
  let result;

  it('Should deploy ClaimHolderFactoryTest', async() => {
    factory = await ClaimHolderFactoryTest.new();
    assert(factory);
  });

});
