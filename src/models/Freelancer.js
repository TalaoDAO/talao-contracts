import Experience from './Experience';
import Competency from './Competency';
import { EventEmitter } from 'events';
import bs58 from 'bs58';


class Freelancer extends EventEmitter {

    constructor() {
        super();

        this.miniVaultContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_MINIVAULT_ABI),
            process.env.REACT_APP_MINIVAULT_ADDRESS
        );

        //get blocknumber
        window.web3.eth.getBlockNumber().then(blockNumber => {
            this.firstBlock = blockNumber;
        });

        this.experiences = [];

        this.eventAddDocumentSubscription();
        this.GetFreeLanceData();
        this.GetAllDocuments();
    }

    getBytes32FromIpfsHash(ipfsAddress) {
        return "0x" + bs58.decode(ipfsAddress).slice(2).toString('hex')
    }

    getIpfsHashFromBytes32(bytes32Hex) {
        // Add our default ipfs values for first 2 bytes:
        // function:0x12=sha2, size:0x20=256 bits
        // and cut off leading "0x"
        const hashHex = "1220" + bytes32Hex.slice(2)
        const hashBytes = Buffer.from(hashHex, 'hex');
        const hashStr = bs58.encode(hashBytes)
        return hashStr
    }

    AddDocument(hashIpfs, experience) {
        var docId = this.getBytes32FromIpfsHash(hashIpfs);

        var title = window.web3.utils.fromAscii(experience.title);
        var description = window.web3.utils.fromAscii(experience.description);
        var keywords = [], ratings = [];
        experience.competencies.forEach(element => {
            keywords.push(window.web3.utils.fromAscii(element.name));
            ratings.push(element.confidenceIndex);
        });

        var documentType = parseInt(experience.type, 10);
        var startDate = experience.from.getTime();
        var endDate = experience.to.getTime();
        var duration = (endDate - startDate);
        if (this.miniVaultContract != null) {
            this.miniVaultContract.methods.addDocument(docId, title, description, keywords, ratings, documentType, startDate, endDate, duration).send(
                {
                    from: window.selectedAccount
                }).on('error', error => {
                    alert("An error has occured when adding your document (ERR: " + error + ")");
                    return;
                }).then(() => {
                    this.emit('ExperienceAdded', this);
                });
        }
    }

    GetFreeLanceData() {
        this.miniVaultContract.getPastEvents('FreelancerUpdateData', {}, { fromBlock: 0, toBlock: 'latest' }).then(events => {
            events.forEach((event => {
                this.firstName = window.web3.utils.hexToAscii(event['returnValues']['firstname']).replace(/\u0000/g, '');
                this.lastName = window.web3.utils.hexToAscii(event['returnValues']['lastname']).replace(/\u0000/g, '');
                this.confidenceIndex = 82;
                this.title = window.web3.utils.hexToAscii(event['returnValues']['title']).replace(/\u0000/g, '');
                this.description = event['returnValues']['description'];
                this.pictureUrl = "freelancer-picture.jpg";
                this.email = window.web3.utils.hexToAscii(event['returnValues']['email']).replace(/\u0000/g, '');
                this.phone = window.web3.utils.hexToAscii(event['returnValues']['phone']).replace(/\u0000/g, '');
                this.ethereumAddress = window.selectedAccount;
            }));
        });
        this.emit('FreeDataChanged', this);
    }

    GetAllDocuments() {
        this.miniVaultContract.getPastEvents('VaultDocAdded', {}, { fromBlock: 0, toBlock: 'latest' }).then(events => {
            events.forEach((event => {
                this.GetDocumentByEvent(event['returnValues']);
            }));
            this.emit('ExperienceChanged', this);
        });
    }

    GetDocumentByEvent(event) {
        var docId = event['documentId'].toString();
        let title = window.web3.utils.hexToAscii(event['title']).replace(/\u0000/g, '');
        var description = window.web3.utils.hexToAscii(event['description']).replace(/\u0000/g, '');
        let startDate = parseInt(event['startDate'], 10);
        let endDate = parseInt(event['endDate'], 10);
        let ratings = event['ratings'];
        let isNumber = event['ratings'][0] === parseInt(event['ratings'][0], 10).toString();
        let keywords = event['keywords'];
        let competencies = [];
        for (let index = 0; index < ratings.length; index++) {
            competencies.push(
                new Competency(
                    window.web3.utils.hexToAscii(keywords[index]).replace(/\u0000/g, ''),
                    (isNumber) ? ratings[index] : ratings[index].c[0]
                )
            );
        }
        let url = "https://gateway.ipfs.io/ipfs/" + this.getIpfsHashFromBytes32(docId);
        var newExp = new Experience(
            title,
            description,
            new Date(startDate),
            new Date(endDate),
            competencies,
            url,
            100
        )
        this.addExperience(newExp);
        this.emit('ExperienceChanged', this);
    }

    eventAddDocumentSubscription() {
        this.contractObjectOldWeb3 = window.web3old.eth.contract(JSON.parse(process.env.REACT_APP_MINIVAULT_ABI));
        var vaultWithOldWeb3 = this.contractObjectOldWeb3.at(process.env.REACT_APP_MINIVAULT_ADDRESS);

        this.eventDocAdded = vaultWithOldWeb3.VaultDocAdded();
        this.eventDocAdded.watch((err, event) => {
            if (err)
                console.log(err);
            else {
                if (event['blockNumber'] > this.firstBlock) {
                    this.GetDocumentByEvent(event['args']);
                }
            }
        });
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