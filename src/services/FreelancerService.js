import Freelancer from "../models/Freelancer";
import Experience from "../models/Experience";
import Competency from "../models/Competency";

class FreelancerService {

    static getFreelancer() {
<<<<<<< HEAD

        if(this.Freelancer == null)
            this.Freelancer = new Freelancer();

        return this.Freelancer;
=======

        if(this.freelancer != null){
            return this.freelancer;
        }

        const miniVaultContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_MINIVAULT_ABI),
            process.env.REACT_APP_MINIVAULT_ADDRESS
        );
        //get blocknumber
        window.web3.eth.getBlockNumber().then(blockNumber => {
            this.firstBlock = blockNumber;
        });
        this.freelancer = new Freelancer();

        miniVaultContract.getPastEvents('VaultDocAdded', {}, { fromBlock: 0, toBlock: 'latest' })
        .then(events => {
            events.forEach((event => {
                var docId = event['returnValues']['documentId'].toString();
                var description = window.web3.utils.hexToAscii(event['returnValues']['description']).replace(/\u0000/g, '');
                var newExp = new Experience(docId,description,new Date(2018, 1, 1),new Date(2018, 6, 1),[new Competency("Project Management", 100)],"https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",100,)
                
                this.freelancer.addExperience(newExp);
            }));
        });
        return this.freelancer;
>>>>>>> 008a050655dca74fd03a0e981e6ef5f1c8d66216
    }

    // static NotifyFreelancerUpdate(freelancer) {
    //     this.Callback(freelancer);
    // }
}

export default FreelancerService;