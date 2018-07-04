import Freelancer from "../models/Freelancer";

const miniVaultContract = new window.web3.eth.Contract(
    JSON.parse(process.env.REACT_APP_MINIVAULT_ABI),
    process.env.REACT_APP_MINIVAULT_ADDRESS
);

class FreelancerService {

    static Init() {

        //get blocknumber
        window.web3.eth.getBlockNumber().then(blockNumber => {
            this.firstBlock = blockNumber;
        });

        miniVaultContract.getPastEvents('VaultDocAdded', {}, { fromBlock: 0, toBlock: 'latest' }).then(events => {
            events.forEach((event => {
                var docId = event['returnValues']['documentId'].toString();
                var description = window.web3.utils.hexToAscii(event['returnValues']['description']).replace(/\u0000/g, '');

                this.state.vaultContract.methods.getDocumentIsAlive(docId).call({from: this.context.web3.selectedAccount})
                .then(documentIsAlive => {
                  if (documentIsAlive) {
                    this.state.vaultContract.methods.getKeywordsNumber(docId).call({from: this.context.web3.selectedAccount})
                    .then(number => {
                        this.pushDocument(number, docId, description);
                    });
                  }
                });
            }));
        });

        //watch events
    }

    static getFreelancer() {
        var freelancer = new Freelancer();

        //init Vault data

        return freelancer;
    }
}

export default FreelancerService;