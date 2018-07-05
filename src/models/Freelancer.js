import Experience from './Experience';
import Competency from './Competency';
import { EventEmitter } from 'events' 


class Freelancer extends EventEmitter {

    GetDocument() {

        const miniVaultContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_MINIVAULT_ABI), 
            process.env.REACT_APP_MINIVAULT_ADDRESS
        );

        //get blocknumber
        window.web3.eth.getBlockNumber().then(blockNumber => {
            this.firstBlock = blockNumber;
        });

        miniVaultContract.getPastEvents('VaultDocAdded', {}, { fromBlock: 0, toBlock: 'latest' }).then(events => {

            events.forEach((event => {
                var docId = event['returnValues']['documentId'].toString();
                var description = window.web3.utils.hexToAscii(event['returnValues']['description']).replace(/\u0000/g, '');
                
                var newExp = new Experience(
                    docId, 
                    description,
                    new Date(2018, 1, 1), 
                    new Date(2018, 6, 1),
                    [
                        new Competency("Project Management", 100)
                    ],
                    "https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",
                    100,
                )
                this.addExperience(newExp);
                alert(docId);
            }));

            this.emit('ExperienceChanged', this);
        });
    }

    constructor() {
        super();

        this.firstName = "Paul";
        this.lastName = "Durand";
        this.confidenceIndex = 82;
        this.title = "Blockchain specialist";
        this.description = "You have a project that implies the use of the blockchain? I can surely guide you to the road of success.";
        this.pictureUrl = "freelancer-picture.jpg";
        this.email = "paul.durand@gmail.com";
        this.phone = "(650) 555-1234";
        this.ethereumAddress = "0xEf9E029Ca326b4201927AD2672545cbE19DA10f1";
        this.experiences = [
            new Experience(
                "Dolor sit amet", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue. Donec vestibulum lectus eu orci eleifend ultrices. Nunc ornare nec libero a ornare. Integer consectetur mi in est maximus tristique. Curabitur maximus ligula ipsum, mollis consequat erat aliquam vitae.",
                new Date(2018, 1, 1), 
                new Date(2018, 6, 1),
                [
                    new Competency("Project Management", 100)
                ],
                "https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",
                100,
            ),
            new Experience(
                "Consectetur adipiscing", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2016, 1, 1), 
                new Date(2018, 1, 1),
                [
                    new Competency("Project Management", 90), 
                    new Competency("Blockchain", 80),
                    new Competency("Javascript", 85)
                ],
                "https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",
                83,
            ),
            new Experience(
                "Consectetur adipiscing 2", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2015, 10, 1), 
                new Date(2016, 1, 1),
                [
                    new Competency("Design", 95), 
                ],
                "https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",
                62,
            ),
            new Experience(
                "Consectetur adipiscing 3", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2015, 3, 1), 
                new Date(2015, 10, 1),
                [
                    new Competency("Javascript", 25), 
                ],
                "https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",
                13,
            ),
            new Experience(
                "Consectetur adipiscing 4", 
                "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec nec ex sodales, finibus quam nec, convallis augue.",
                new Date(2013, 1, 1), 
                new Date(2015, 3, 1),
                [
                    new Competency("Education", 35), 
                ],
                "https://raw.githubusercontent.com/blockchain-certificates/cert-verifier-js/master/tests/data/sample-cert-mainnet-valid-2.0.json",
                63,
            ),
        ]


        QmRnomvox8vNL32medAmjyURxHqj9enP8hySh1i5QWTLtJ
        
        this.GetDocument();
    }

    eventAddDocumentSubscription() {
        this.contractObjectOldWeb3 = window.web3old.eth.contract(JSON.parse(process.env.REACT_APP_MINIVAULT_ABI));
        var vaultWithOldWeb3 = this.contractObjectOldWeb3.at(process.env.REACT_APP_MINIVAULT_ADDRESS);

        this.eventDocAdded = vaultWithOldWeb3.VaultDocAdded();
        this.eventDocAdded.watch((err, event) => {
            if (err)
                console.log(err);
            else {
                if (event['blockNumber'] > this.state.firstBlock) {
                    var docId = event['args']['documentId'];
                    var description = window.web3.utils.hexToAscii(event['args']['description']).replace(/\u0000/g, '')
                    this.state.vaultContract.methods.getKeywordsNumber(docId).call({from: this.context.web3.selectedAccount})
                    .then(number => {
                        this.pushDocument(number, docId, description);
                        this.goToVault();
                    });

                }
            }
        });
    }

    firstName() {
        return this.firstName;
    }

    experiences() {
        return this.experiences;
    }

    getCompetencies() {
        let competencies = [];
        this.experiences.forEach((experience) => {
            experience.competencies.forEach((competency) => {
                let indexCompetency = competencies.findIndex(c => c.name === competency.name);
                if (indexCompetency === -1) {
                    competencies.push(new Competency(competency.name, competency.confidenceIndex, [experience]));
                }
                else {
                    competencies[indexCompetency].experiences.push(experience);
                }
            });
        });
        return competencies;
    }
    
    addExperience(exp) {
        this.experiences.push(exp);
    }

    updateProfil(firstName, lastName, title, description, email, phone) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.title = title;
        this.description = description;
        this.email = email;
        this.phone = phone;
    }

}

export default Freelancer;