// Fill in ./secret.js to deploy on real networks
const HDWalletProvider = require('truffle-hdwallet-provider');
const secret = require('./secret');
const mnemonic = secret.mnemonic();
const infuraApiKey = secret.infuraApiKey();

/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777"
    },
    rinkeby: {
      network_id: "4",
      gasPrice: 100000000,
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/" + infuraApiKey, 0);
      }
    },
    ropsten: {
      network_id: "3",
      gasPrice: 100000000,
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infuraApiKey, 0);
      }
    },
    mainnet: {
      network_id: "1",
      gasPrice: 100000000,
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://mainnet.infura.io/" + infuraApiKey, 0);
      }
    }
  },
  solc: {
    version: "0.4.24",
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  mocha: {
    reporter: "mocha-truffle-reporter"
  }
}
