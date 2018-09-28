import Experience from './Experience';
import Competency from './Competency';
import FileService from '../services/FileService';
import ExperienceService from '../api/experiences';

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
        this.experiencesFromBack = [];
        this.experiences = [];
        this.competencies = [];
    }

    getFreelanceData() {
        return new Promise((resolve, reject) => {
            this.freelancerContract.methods.Freelancers(this.ethAddress).call().then(element => {
                this.firstName = window.web3.utils.hexToAscii(element.firstname).replace(/\u0000/g, '');
                this.lastName = window.web3.utils.hexToAscii(element.lastname).replace(/\u0000/g, '');
                this.title = window.web3.utils.hexToAscii(element.title).replace(/\u0000/g, '');
                this.description = element.description;
                this.pictureUrl = (element.picture === '0x0000000000000000000000000000000000000000000000000000000000000000') ? null : "https://gateway.ipfs.io/ipfs/" + FileService.getIpfsHashFromBytes32(element.picture);
                this.email = window.web3.utils.hexToAscii(element.email).replace(/\u0000/g, '');
                this.phone = window.web3.utils.hexToAscii(element.mobile).replace(/\u0000/g, '');
                this.ethereumAddress = this.ethAddress;
                this.confidenceIndex = 0;
                resolve(true);
            }).catch(error => {
                reject(error);
            })
        });
    }

    getDocumentByEvent(docId, cb) {
            //Check if the doc is active
            this.getDocumentIsAlive(docId).then((isAlive) => {
                if (isAlive) {
                    //Get the data of the doc
                    this.vaultContract.methods.getDoc(docId).call({from : this.ethAddress}).then(data => { 
                        let title = window.web3.utils.hexToAscii(data['title']).replace(/\u0000/g, '');
                        var description = window.web3.utils.hexToAscii(data['description']).replace(/\u0000/g, '');
                        let startDate = parseInt(data['start'], 10);
                        let endDate = parseInt(data['end'], 10);
                        let ratings = this.noHashIpfs(data['ipfs']) ? [] : data['ratings'];
                        let keywords = data['keywords'];
                        let jobDuration = data['duration'] ? data['duration'] : 1;
                        let competencies = [];
                        for (let index = 0; index < keywords.length; index++) {
                            competencies.push(new Competency(window.web3.utils.hexToAscii(keywords[index].replace(/\u0000/g, '')), this.noHashIpfs(data['ipfs']) ? 0 : ratings[1], null, jobDuration));
                        }
                        //complete the exp with blockchain infos
                        let index = this.experiencesFromBack.findIndex(x => x.idBlockchain === parseInt(docId, 10));
                        let idBack = null;
                        let certificatAsked = false;
                        if (index !== -1) {
                            idBack = this.experiencesFromBack[index].idBack;
                            certificatAsked = this.experiencesFromBack[index].certificatAsked;
                        }
                        let experienceToAdd = new Experience(title, description, new Date(startDate), new Date(endDate), competencies, 
                        this.noHashIpfs(data['ipfs']) ? null : "https://gateway.ipfs.io/ipfs/" + FileService.getIpfsHashFromBytes32(data['ipfs']), 
                        this.noHashIpfs(data['ipfs']) ? null : ratings, jobDuration, certificatAsked, parseInt(docId, 10), idBack);
                         this.addExperience(experienceToAdd);
                    }).then(() => {
                        cb();
                    });
                }
            });
    }

    noHashIpfs(hash) {
        return hash === '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    addExperience(exp) {
        this.experiences.push(exp);
    }

    getDocumentIsAlive(docId) {
        return this.vaultContract.methods.isDocPublished(docId).call({ from: this.ethAddress });
    }

    getAllDocuments(docsId) {
        return new Promise((resolve) => {
            let requests = docsId.map((index) => {
                return new Promise((resolve) => {
                    this.getDocumentByEvent(index, resolve);
                })
            });
            Promise.all(requests).then(() => resolve(true));
        });
    }

    getAllDocsId() {
            return this.vaultContract.methods.getDocs().call({from : this.ethAddress});
    }
    
    getAllDraftDocumentsFromBackend() {
        return new Promise((resolve) => {
            let experienceService = ExperienceService.getExperienceService();
            experienceService.getAllFromEth(this.ethAddress).then(response => {       
                //if the API send back an error
                if (response.error) 
                    resolve(false);
                else if (response.length === 0) {
                    resolve(true);
                } else {
                    response.forEach((exp, index) => {
                        let competencies = [];
                        for (let i = 1; i <= 10; i++) {
                            if (exp['skill' + i]) {
                                competencies.push(new Competency(exp['skill' + i], 0, null, 0));
                            }
                        }
                        if (!exp.idBlockchain)
                            this.addExperience(new Experience(exp.job_title, exp.job_description, new Date(exp.date_start), new Date(exp.date_end), competencies, null, 0, exp.job_duration, exp.certificatAsked, exp.idBlockchain, exp.id));                     
                        //Save the full list for data management...
                        this.experiencesFromBack.push(new Experience(exp.job_title, exp.job_description, new Date(exp.date_start), new Date(exp.date_end), competencies, null, 0, exp.job_duration, exp.certificatAsked, exp.idBlockchain, exp.id));
                        
                        if (index + 1 === response.length) 
                        resolve(true);
                    });
                }
            }).catch(() => {
                // if an error is not handle
                resolve(false);
            });
        });
    }

    addDocument(title, description, startDate, endDate, jobDuration, keywords, ratings, documentType, ipfsHash) {
        return this.vaultContract.methods.createDoc(title, description, startDate, endDate, jobDuration, keywords, ratings, documentType, ipfsHash)
                                        .send({from: window.account, gasPrice: process.env.REACT_APP_TRANSACTION_ADD_DOC});
    }

    removeDocument(id) {
        return this.vaultContract.methods.deleteDoc(id)
                                        .send({from: window.account, gasPrice: process.env.REACT_APP_TRANSACTION_REMOVE_DOC});
    }

    getCompetencies() {
        return new Promise((resolve) => {
            if (this.experiences.length === 0)
                resolve(true);
            let competencies = [];
            this.experiences.forEach((experience) => {
                if (experience.certificatUrl) {
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
                }
            });
            this.competencies = competencies;
            resolve(true);
        });
    }

    getGlobalConfidenceIndex() {
        let totalDuration = 0;
        let totalNotation = 0;
        return new Promise(resolve => {
            if (this.experiences.length === 0)
                resolve(true);
            this.experiences.forEach((experience, index) => {
                if (experience.certificatUrl) {
                    let duration = parseInt(experience.jobDuration, 10);
                    let notation = 0
                    for (var i = 0; i < 5; i++) {
                        notation += parseInt(experience.confidenceIndex[i], 10);
                    }
                    totalNotation += (notation / 5) * duration;
                    totalDuration += duration;
                }
                if (index + 1 === this.experiences.length) {
                    this.confidenceIndex = (totalNotation > 0 && totalDuration > 0 ) ? Math.round((totalNotation / totalDuration) * 10) / 10 : 0;
                    resolve(true);
                }
            });
        });
    }
}

export default Freelancer;
