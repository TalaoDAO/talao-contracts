# Talao smart contracts

*If you are looking for the real code of the Talao token deployed in the mainnet ICO, please go here: https://github.com/TalaoDAO/talao-crowdsale. The token code is here as well but it's an updated version, just to get rid of warnings.*

## Deployed contracts

### Rinkeby

*  TalaoToken: https://rinkeby.etherscan.io/address/0xb8a0a9ee2e780281637bd93c13076cc5e342c9ae
*  Foundation: https://rinkeby.etherscan.io/address/0x3142e434cb8f07ab2a2afd4346f1b0aa0acf6bd6
*  WorkspaceFactory: https://rinkeby.etherscan.io/address/0x3cf7e59f312af321abe379cf1c62b75b718dba91
*  KeyHolderLibrary: https://rinkeby.etherscan.io/address/0x22d4611ecb247445374b30f92a32bf6c57010f62
*  ClaimHolderLibrary: https://rinkeby.etherscan.io/address/0x503301375d2085dd24decc255fbcb362fd33e648

## Bug bounty program

### Rules

#### Reporting

Anyone able to find security flaws or other problems in our smart contracts is encouraged to take part in our bounty program and submit the bug with the following details:

+ Short description of vulnerability
+ Long description of vulnerability
+ Vulnerable application name
+ Steps to reproduce bug
+ Severity (Note, Low, Medium, High, Critical)
+ Impact
+ Screenshots (if applicable)
+ Recommended fix
+ Your Ethereum address

#### Scope

The [TALAO token](https://github.com/TalaoDAO/talao-contracts/tree/master/contracts/token), encryption code which is done off-chain and the [service prototype](https://github.com/TalaoDAO/talao-contracts/blob/master/contracts/test/Service1.sol) are not in the scope of the bug bounty program.

Those known problems are not in the scope, as well:

+ in the token, getVaultAccess(freelance, '0x0000000000000000000000000000000000000000') always returns true. By default, when no account is provided, like for instance when connecting through Infura without a wallet, msg.sender = 0x0000000000000000000000000000000000000000. So we need to update isReader() in Permissions.sol in order to allow only msg.sender = 0x0000000000000000000000000000000000000000 when the Vault access price = 0

#### Rewards & attribution

The rewards for accepted bugs are as follows:

+ Critical: Eth 5 to 10
+ High: Eth 1 to 5
+ Medium: Eth 0.5 to 1
+ Low: Eth 0.1 to 0.5
+ Note: up to Eth 0.1

The total bug bounty program allocation is Eth 50.

The team reserves the right to change the suggested severity level or ignore the bug report if they will find it not applicable. Only the first person who sends the particular vulnerability will be authorized to receive the bounty. Please send all vulnerabilities to bugbounty@talao.io. We thank you in advance for helping us to develop even more secure software.

### Additional information

+ Please read [Talao announces a new release of its protocol together with a bug bounty program](https://medium.com/@talao/talao-announces-a-new-release-of-its-protocol-together-with-a-bug-bounty-program-f45fdc5fe511) to understand the purposes of those contracts (link coming soon).
+ You'll also find a diagram below to help you understand the smart contracts architecture.
+ Installation and tests work as usual. Truffle v4.1.14 is required and contracts are written in Solidity 0.4.24.

## Smart contracts architecture

![Talao smart contracts architecture](https://raw.githubusercontent.com/TalaoDAO/talao-contracts/gh-pages/smart-contracts-architecture.png)

+ **Red**: Workspaces. Those are the final smart contracts deployed for Freelancers, Marketplaces, ...
+ **Orange**: Those are the smart contracts Workspaces interact with: the Talao Token ([already deployed on Mainnet](https://etherscan.io/address/0x1d4ccc31dab6ea20f461d329a0562c1c58412515)) and the Foundation (soon to be deployed)
+ Green and blue: inherited smart contracts (not deployed). Any Workspace final contract contains all the code of inherited smart contracts. Green are ERC standards, blue are their implementation and also specific Talao code.
+ Gray: Librairies. Those are deployed and used by each Workspace, to avoid deploying full copies of the code each time.

## Credits

*Huge thanks to the awesome Ethereum community which provide us with great tools, Solidity code and inspiration. Special thanks to [OriginProtocol](https://www.originprotocol.com) for their implementation of ERC 725 and ERC 735, which we use with slight modifications.*
