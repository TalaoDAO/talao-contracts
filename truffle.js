module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ganache: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // matching any id
    },
    parity: {
      host: "127.0.0.1",
      port: 8180,
      network_id: "*" // matching any id
    }
  }
};
