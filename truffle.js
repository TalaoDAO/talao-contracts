// Comment those lines if you do not want to deploy with Truffle + Infura on Ropsten.
// To use it you must npm install truffle-hdwallet-provider
const secret = require('./secret');
const mnemonic = secret.mnemonic();
const infuraApiKey = secret.infuraApiKey();
const HDWalletProvider = require('truffle-hdwallet-provider');

require('babel-register');
require('babel-polyfill');

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: 3
    },
    parity: {
      host: "127.0.0.1",
      port: 8180,
      network_id: "*" // matching any id
    },
    testrpc: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // matching any id
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infuraApiKey, 5)
      },
      network_id: 3
    }
  }
};
