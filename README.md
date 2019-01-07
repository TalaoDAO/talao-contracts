# Talao smart contracts

*If you are looking for the real code of the Talao token deployed in the mainnet ICO, please go here: https://github.com/TalaoDAO/talao-crowdsale. The token code is here as well but it's an updated version, just to get rid of warnings.*

**Welcome to the Talao protocol bug bounty program.**

+ Please start by reading [Talao announces a new release of its protocol together with a bug bounty program](https://github.com/TalaoDAO/talao-contracts) (link coming soon).
+ Then, please check the [Talao protocol bug bounty program](https://github.com/TalaoDAO/talao-contracts) (link coming soon).
+ Below, you'll also find a diagram to help you understand the smart contracts architecture.
+ Installation and tests work as usual, nothing special here.

*Thanks for your attention, and have a good bug hunt!*

## Smart contracts architecture

![Talao smart contracts architecture](https://raw.githubusercontent.com/TalaoDAO/talao-contracts/gh-pages/smart-contracts-architecture.png)

+ **Red**: Workspaces. Those are the final smart contracts deployed for Freelancers, Marketplaces, ...
+ **Orange**: Those are the smart contracts Workspaces interact with: the Talao Token ([already deployed on Mainnet](https://etherscan.io/address/0x1d4ccc31dab6ea20f461d329a0562c1c58412515)) and the Foundation (soon to be deployed)
+ Green and blue: inherited smart contracts (not deployed). Any Workspace final contract contains all the code of inherited smart contracts. Green are ERC standards, blue are their implementation and also specific Talao code.
+ Gray: Librairies. Those are deployed and used by each Workspace, to avoid deploying full copies of the code each time.

## Credits

*Huge thanks to the awesome Ethereum community which provide us with great tools, Solidity code and inspiration. Special thanks to [OriginProtocol](https://www.originprotocol.com) for their implementation of ERC 725 and ERC 735, which we use with slight modifications.*
