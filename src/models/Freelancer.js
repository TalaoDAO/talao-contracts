import Experience from './Experience';
import Competency from './Competency';
import FileService from '../services/FileService';

class Freelancer {

    constructor(vaultAddress, ethAddress) {

        this.freelancerContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_FREELANCER_ABI),
            process.env.REACT_APP_FREELANCER_ADDRESS
        );

        this.vaultContract = new window.web3.eth.Contract(
            JSON.parse(process.env.REACT_APP_VAULT_ABI),
            vaultAddress
        );

        //get blocknumber
        window.web3.eth.getBlockNumber().then(blockNumber => {
            this.firstBlock = blockNumber;
        });

        this.ethAddress = ethAddress;
        this.vaultAddress = vaultAddress;
        this.experiences = [];
        this.competencies = [];
    }
    
    getFreelanceData() {
        return new Promise((resolve, reject) => {
            this.freelancerContract.methods.FreelancerInformation(this.ethAddress).call().then(element => {
                this.firstName = window.web3.utils.hexToAscii(element.firstName).replace(/\u0000/g, '');
                this.lastName = window.web3.utils.hexToAscii(element.lastName).replace(/\u0000/g, '');
                this.title = window.web3.utils.hexToAscii(element.title).replace(/\u0000/g, '');
                this.description = element.description;
                this.pictureUrl = "https://gateway.ipfs.io/ipfs/" + FileService.getIpfsHashFromBytes32(element.picture);
                this.email = window.web3.utils.hexToAscii(element.email).replace(/\u0000/g, '');
                this.phone = window.web3.utils.hexToAscii(element.mobilePhone).replace(/\u0000/g, '');
                this.ethereumAddress = this.ethAddress;
                this.confidenceIndex = 0;
                resolve(true);
            }).catch(error => {
                reject(error);
            })
        });
    }

    getDocumentByEvent(event, cb) {
            var docId = event['documentId'].toString();
            this.getDocumentIsAlive(docId).then((isAlive) => {
                if (isAlive) {
                    let title = window.web3.utils.hexToAscii(event['title']).replace(/\u0000/g, '');
                    if (this.experiences.some(e => e.title === title)) return;
                    var description = window.web3.utils.hexToAscii(event['description']).replace(/\u0000/g, '');
                    let startDate = parseInt(event['startDate'], 10);
                    let endDate = parseInt(event['endDate'], 10);
                    let ratings = event['ratings'];
                    let isNumber = event['ratings'][0] === parseInt(event['ratings'][0], 10).toString();
                    let keywords = event['keywords'];
                    let jobDuration = Math.floor(Math.random() * Math.floor(5000)); //TODO:REPLACE BY READ SC
                    let competencies = [];
                    for (let index = 0; index < ratings.length; index++) {
                        competencies.push(
                            new Competency(
                                window.web3.utils.hexToAscii(keywords[index]).replace(/\u0000/g, ''),
                                (isNumber) ? ratings[index] : ratings[index].c[0]
                            )
                        );
                    }
                    let url = "https://gateway.ipfs.io/ipfs/" + FileService.getIpfsHashFromBytes32(docId);
                    var newExp = new Experience(
                        docId,
                        title,
                        description,
                        new Date(startDate),
                        new Date(endDate),
                        competencies,
                        url,
                        100,
                        null,
                        jobDuration
                    )
                    this.addExperience(newExp);
                }
            }).then(() => {
                let competencies = [];
                this.experiences.forEach((experience) => {
                    experience.competencies.forEach((competency) => {
                        let indexCompetency = competencies.findIndex(c => c.name === competency.name);
                        if (indexCompetency === -1) {
                            competencies.push(new Competency(competency.name, parseInt(competency.confidenceIndex, 10), [experience], experience.jobDuration));
                        }
                        else {
                            competencies[indexCompetency].updateConfidenceIndex(competency.confidenceIndex, experience.jobDuration);
                            competencies[indexCompetency].experiences.push(experience);
                        }
                    });
                });
                this.competencies = competencies;
                let confidenceIndex = 0;
                competencies.forEach((competencie) => {
                    confidenceIndex += competencie.confidenceIndex;
                });
                this.confidenceIndex = confidenceIndex / competencies.length;
                cb()
            });
    }

    addExperience(exp) {
        this.experiences.push(exp);
    }

    getDocumentIsAlive(docId) {
        return this.vaultContract.methods.getDocumentIsAlive(docId).call({ from: this.ethAddress });
    }

    getAllDocuments() {
        return new Promise((resolve) => {
            this.vaultContract.getPastEvents('VaultDocAdded', {}, { fromBlock: 0, toBlock: 'latest' }).then(events => {
                let requests = events.map((event) => {
                    return new Promise((resolve) => {
                        this.getDocumentByEvent(event['returnValues'], resolve);
                    })
                });
                Promise.all(requests).then(() => resolve(true));
            });
        })
    }
    
    addDocument(experience) {
        var docId = FileService.getBytes32FromIpfsHash(experience.docId);
        var title = window.web3.utils.fromAscii(experience.title);
        var description = window.web3.utils.fromAscii(experience.description);
        var keywords = [], ratings = [];
        experience.competencies.forEach(element => {
            keywords.push(window.web3.utils.fromAscii(element.name));
            ratings.push(element.confidenceIndex);
        });
        var jobDuration = experience.jobDuration;
        var documentType = parseInt(experience.type, 10);
        var startDate = experience.from.getTime();
        var endDate = experience.to.getTime();
        
        return this.vaultContract.methods.addDocument(docId, title, description, keywords, ratings, documentType, startDate, endDate, jobDuration)
                                        .send({from: window.account});
    }
    
    removeDoc(experience) {
        return this.vaultContract.methods.removeDocument(experience.docId).send({ from: window.account });
    }

    getCompetencies() {
        return new Promise((resolve) => {
            let competencies = [];
            console.log(this.experiences);
            this.experiences.forEach((experience) => {
                experience.competencies.forEach((competency) => {
                    let indexCompetency = competencies.findIndex(c => c.name === competency.name);
                    if (indexCompetency === -1) {
                        competencies.push(new Competency(competency.name, parseInt(competency.confidenceIndex, 10), [experience], experience.jobDuration));
                    }
                    else {
                        competencies[indexCompetency].updateConfidenceIndex(competency.confidenceIndex, experience.jobDuration);
                        competencies[indexCompetency].experiences.push(experience);
                    }
                });
            });
            this.competencies = competencies;
            let confidenceIndex = 0;
            competencies.forEach((competencie) => {
                confidenceIndex += competencie.confidenceIndex;
            });
            this.confidenceIndex = confidenceIndex / competencies.length;
            this.competencies = competencies;
            resolve(true);
        });
    }
}

export default Freelancer;