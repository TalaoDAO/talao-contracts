import Experience from '../models/Experience';
import { fetchUserSuccess } from '../actions/user'
import Competency from '../models/Competency';
import { changeMenu } from './menu';
import ExperienceService from '../api/experiences';
import OrganizationService from '../api/organization';
import { transactionHash, transactionReceipt, transactionError, transactionBegin } from '../actions/transactions';
import FileService from '../services/FileService';

export const ASYNC_CALL_BEGIN            = 'ASYNC_CALL_BEGIN';
export const ASYNC_CALL_SUCCESS          = 'ASYNC_CALL_SUCCESS';
export const ASYNC_CALL_ERROR            = 'ASYNC_CALL_ERROR';
export const GET_ORGANIZATIONS           = 'GET_ORGANIZATIONS';
export const SET_EXPERIENCE_FORM_INPUT   = 'SET_EXPERIENCE_FORM_INPUT';
export const SET_ORGANIZATION_FORM_INPUT = 'SET_ORGANIZATION_FORM_INPUT';
export const EXPAND_PROFIL               = 'EXPAND_PROFIL';
export const NEW_EXPERIENCE_CLICKED      = 'NEW_EXPERIENCE_CLICKED';

//API STATE
export const asyncCallBegin = () => ({
    type: ASYNC_CALL_BEGIN
  });

export const asyncCallSuccess = (success) => ({
    type: ASYNC_CALL_SUCCESS,
    success
});

export const asyncCallError = (error) => ({
    type: ASYNC_CALL_ERROR,
    error
});

//FORM INPUT
export const setExperienceFormInput = (property, value) => ({
    type: SET_EXPERIENCE_FORM_INPUT,
    property,
    value
});

export const setOrganizationFormInput = (property, value) => ({
    type: SET_ORGANIZATION_FORM_INPUT,
    property,
    value
});

export const newExperience = (value) => ({
    type: NEW_EXPERIENCE_CLICKED,
    value
});

export const setSkills = skills => ({
    type: SET_SKILLS,
    skills
});

export const expandProfil = expandProfil => ({
    type: EXPAND_PROFIL,
    expandProfil
});

//API CALL
export const getOrganizations = (organizations) => ({
    type: GET_ORGANIZATIONS,
    organizations
});

export function fetchOrganizations() {
    return dispatch => {
        dispatch(asyncCallBegin());
        let organizationService = OrganizationService.getOrganizationService();
        organizationService.getOrganizations().then(response => {       
            //if the API send back an error
            if (response.error) 
                dispatch(asyncCallError(response.error));
            else {
                // if the API send success
                dispatch(asyncCallSuccess());

                dispatch(getOrganizations(response));
            }
        }).catch(error => {
            // if an error is not handle
            dispatch(asyncCallError(error));
        });
    };
}

export function removeExpFromBackend(exp, user) {
    return dispatch => {
        dispatch(asyncCallBegin());
        let experienceService = ExperienceService.getExperienceService();
        experienceService.delete(exp.idBack).then(response => {       
            if (response.error) 
                dispatch(asyncCallError(response.error));
            else {
                let itemToRemove = user.freelancerDatas.experiences.findIndex(x => x.idBack === exp.idBack && !x.idBlockchain && x.certificatAsked === false);
                user.freelancerDatas.experiences.splice(itemToRemove, 1);
                dispatch(fetchUserSuccess(user));
                dispatch(asyncCallSuccess());
            }
        }).catch(() => {
            dispatch(asyncCallError());
        });
    };
}

export function fetchExperience(experience, organization, user) {
    return dispatch => {
        dispatch(asyncCallBegin());
        let experienceService = ExperienceService.getExperienceService();
        let organizationService = OrganizationService.getOrganizationService();

        experienceService.add(experience).then(response => {
            if (response.error) 
                dispatch(asyncCallError(response.error));
            else {

                //Set the success & reset the state
                dispatch(asyncCallSuccess());

                //Add the new experience to the user
                let competencies = [];
                for (let i = 1; i <= 10; i++) {
                    if (experience['skill' + i]) {
                        competencies.push(new Competency(experience['skill' + i], 0, null, 0));
                    }
                }
                user.freelancerDatas.addExperience(
                    new Experience(experience.job_title, 
                                   experience.job_description, 
                                   new Date(experience.date_start),
                                   new Date(experience.date_end), 
                                   competencies, null, 0, 
                                   experience.job_duration, 
                                   experience.certificatAsked, 
                                   experience.postedOnBlockchain,
                                   response.id));
                dispatch(fetchUserSuccess(user));

                //reset the state
                dispatch({type:'RESET_EXPERIENCE_REDUCER'});
                
                //Add the organization if the user ask for it
                if (organization) {
                    organization.createdByFree = experience.freelanceEthereumAddress;
                    organizationService.add(organization).then(response => {
                        if (response.error) 
                            dispatch(asyncCallError(response.error));
                    }).catch(() => {
                        dispatch(asyncCallError('Failed to create the organization'));
                    });
                }
            }
        }).catch(error => {
            // if an error is not handle
            dispatch(asyncCallError(error));
        });
    };
}

export function askForCertificate(experienceId, user) {
    return dispatch => {

        dispatch(asyncCallBegin());

        let experience = { certificatAsked: true };
        let experienceService = ExperienceService.getExperienceService();
        experienceService.update(experienceId, experience).then(response => {
            if (response.error) 
                dispatch(asyncCallError(response.error));
            else {
                dispatch(asyncCallSuccess());
                let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experienceId && x.certificatAsked === false);
                user.freelancerDatas.experiences[index].certificatAsked = true;
                dispatch(fetchUserSuccess(user))
            }
        }).catch(error => {
            // if an error is not handle
            dispatch(asyncCallError(error));
        });
    };
}

export function newExperienceClicked(value, user) {
    return dispatch => {
        if(value) {
            dispatch(setExperienceFormInput('freelanceName', user.freelancerDatas.firstName + ' ' + user.freelancerDatas.lastName));
            dispatch(setExperienceFormInput('freelanceEmail', user.freelancerDatas.email));
            dispatch(setExperienceFormInput('freelanceEthereumAddress', user.freelancerDatas.ethAddress));
            dispatch(fetchOrganizations());
        }
        dispatch(newExperience(value));
    }
}

export function moveToNewExp(history) {
    return dispatch => {
        dispatch(newExperience(true));
        dispatch(changeMenu('/chronology', false));
        history.push('/chronology');
    }
}

export function addCertificat(certToAdd, experience, user) {
    return dispatch => {
        let file = certToAdd.files[0];
        if (typeof file === 'undefined')
            return;

        let reader = new FileReader();
        reader.onload = function (event) {
            try {
                //Upload the file
                FileService.uploadToIpfs(file).then(result => {
                    //Check if the doc is already uploaded
                    let alreadyUploded = false;
                    user.freelancerDatas.experiences.forEach(experience => {
                        if (experience.postedOnBlockchain === 1 && FileService.getIpfsHashFromBytes32(experience.docId) === result) {
                            alreadyUploded = true;
                            dispatch(transactionError(new Error('You have already upload this file.')));
                            dispatch(asyncCallError(new Error('You have already upload this file.')));
                        }
                    });
                    if (!alreadyUploded) {
                        //Parse the JSON
                        var json = JSON.parse(event.target.result);

                        //Parse the skills and ratings
                        let keywords = [], ratings = [];
                        for (let i = 1; i <= 10; i++) {
                            if (json['jobSkill' + i]) {
                                keywords.push(window.web3.utils.fromAscii(json['jobSkill' + i]));
                            }
                            if (i <= 6 && json['jobRating' + i]) {
                                ratings.push(json['jobRating' + i]);
                            }
                        }

                        //Submit to blockchain
                        dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
                        user.freelancerDatas.addDocument(
                            window.web3.utils.fromAscii(json.jobTitle),
                            window.web3.utils.fromAscii(json.jobDescription),
                            new Date(json.jobStart).getTime(),
                            new Date(json.jobEnd).getTime(),
                            json.jobDuration,
                            keywords,
                            ratings,
                            4,
                            FileService.getBytes32FromIpfsHash(result)  
                        ).once('transactionHash', (hash) => { 
                            dispatch(transactionHash(hash));
                        })      
                        .once('receipt', (receipt) => { 
                            dispatch(transactionReceipt(receipt));
                        })
                        .on('error', (error) => { 
                            dispatch(transactionError(error));
                        })
                        .then(value => {

                            //get the id from the event
                            let idFromBlockchain = parseInt(value.events.NewDocument.returnValues[0], 10);

                            //remove the exp get from the backend
                            let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && !x.postedOnBlockchain);

                            //Build the new experience
                            let competencies = [];
                            for (let i = 1; i <= 10; i++) {
                                if (json['jobSkill' + i]) {
                                    competencies.push(new Competency(json['jobSkill' + i], ratings[1], null, json.jobDuration));
                                }
                            }
                            let experienceToAdd = new Experience(json.jobTitle, json.jobDescription, new Date(json.jobStart), 
                            new Date(json.jobEnd), competencies, "https://gateway.ipfs.io/ipfs/" + result, ratings, json.jobDuration,
                            experience.certificatAsked, idFromBlockchain, experience.idBack);

                            //remove the experience fetch from the back
                            user.freelancerDatas.experiences.splice(index, 1);

                            //Add the one build on blockchain
                            user.freelancerDatas.experiences.push(experienceToAdd);

                            //Refresh the competencies & update the user
                            user.freelancerDatas.getCompetencies().then(resolve => {
                                if (resolve) {
                                    user.freelancerDatas.getGlobalConfidenceIndex().then(resolve => {
                                        if (resolve) {
                                            dispatch(fetchUserSuccess(user));
                                        }
                                    });
                                }
                            });

                            //Delete the experience
                            let experienceService = ExperienceService.getExperienceService();
                            experienceService.delete(experience.idBack).then(response => {
                                if (response.error) 
                                    dispatch(asyncCallError(response.error));
                                else 
                                    dispatch(asyncCallSuccess());                            
                            }).catch(error => {
                                // if an error is not handle
                                dispatch(asyncCallError(error));
                            });
                        })
                        .catch((error) => {
                            dispatch(asyncCallError(error));
                        });
                    }
                }, err => dispatch(asyncCallError(err)));
            } catch (e) {
                let error = {};
                error.message = 'Invalid JSON';
                dispatch(transactionError(error));
            }
        }
        reader.readAsText(file);
    };
}

export function postExperience(experience, user) {
    return dispatch => {
        //Submit to blockchain
        let keywords = [];
        for (let i = 0; i < experience.competencies.length; i++) {
            keywords.push(window.web3.utils.fromAscii(experience.competencies[i].name));
        }
        dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
        user.freelancerDatas.addDocument(
            window.web3.utils.fromAscii(experience.title),
            window.web3.utils.fromAscii(experience.description),
            new Date(experience.from).getTime(),
            new Date(experience.to).getTime(),
            experience.jobDuration,
            keywords,
            [],
            4,
            window.web3.utils.fromAscii('') 
        ).once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })      
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        })
        .then(value => {
            //get the id from the event
            let idFromBlockchain = parseInt(value.events.NewDocument.returnValues[0], 10);

            //complete the exp with blockchain infos
            let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && !x.idBlockchain);
            user.freelancerDatas.experiences[index].idBlockchain = idFromBlockchain;

            //Set the flag on the back
            let experienceModified = { idBlockchain: idFromBlockchain };
            let experienceService = ExperienceService.getExperienceService();
            experienceService.update(experience.idBack, experienceModified).then(response => {
                if (response.error) 
                    dispatch(asyncCallError(response.error));
                else {
                    dispatch(asyncCallSuccess());  
                    dispatch(fetchUserSuccess(user)); 
                }                         
            }).catch(error => {
                // if an error is not handle
                dispatch(asyncCallError(error));
            });
        })
        .catch((error) => {
            dispatch(asyncCallError(error));
        });
    };
}

export function unPostExperience(experience, user) {
    return dispatch => {
        
        //Submit to blockchain
        dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
        user.freelancerDatas.removeDocument(
            experience.idBlockchain
        ).once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })      
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        })
        .then(() => {
            //remove the blockchain exp and replace it by the back one
            let index = user.freelancerDatas.experiences.findIndex(x => x.idBack === experience.idBack && x.idBlockchain === experience.idBlockchain);
            user.freelancerDatas.experiences[index].idBlockchain = null;

            //Set the flag on the back
            let experienceModified = { idBlockchain: null };
            let experienceService = ExperienceService.getExperienceService();
            experienceService.update(experience.idBack, experienceModified).then(response => {
                if (response.error) 
                    dispatch(asyncCallError(response.error));
                else {
                    dispatch(asyncCallSuccess());  
                    dispatch(fetchUserSuccess(user)); 
                }                         
            }).catch(error => {
                // if an error is not handle
                dispatch(asyncCallError(error));
            });
        })
        .catch((error) => {
            dispatch(asyncCallError(error));
        });
    };
}

export function removeBlockchainExp(experience, user) {
    return dispatch => {
        
        //Submit to blockchain
        dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
        user.freelancerDatas.removeDocument(
            experience.idBlockchain
        ).once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })      
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        })
        .then(() => {
            //remove the blockchain exp and replace it by the back one
            let index = user.freelancerDatas.experiences.findIndex(x => x.idBlockchain === experience.idBlockchain);
            user.freelancerDatas.experiences.splice(index, 1);
            dispatch(asyncCallSuccess());  
            dispatch(fetchUserSuccess(user)); 
        })
        .catch((error) => {
            dispatch(asyncCallError(error));
        });
    };
}