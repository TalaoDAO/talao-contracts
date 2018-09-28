import { transactionHash, transactionReceipt, transactionError, transactionBegin } from '../actions/transactions'

import OrganizationService from '../api/organization';
import Experience from '../models/Experience';
import { fetchUserSuccess } from '../actions/user'
import Competency from '../models/Competency';
import FileService from '../services/FileService';
import { changeMenu } from './menu';
import ExperienceService from '../api/experiences';

export const GET_ORGANIZATIONS_BEGIN   = 'GET_ORGANIZATIONS_BEGIN';
export const GET_ORGANIZATIONS_SUCCESS = 'GET_ORGANIZATIONS_SUCCESS';
export const GET_ORGANIZATIONS_ERROR   = 'GET_ORGANIZATIONS_ERROR';
export const SET_EXPERIENCE_FORM_INPUT = 'SET_EXPERIENCE_FORM_INPUT';

export const ADD_DOC_BEGIN             = 'ADD_DOC_BEGIN';
export const ADD_DOC_SUCCESS           = 'ADD_DOC_SUCCESS';
export const ADD_DOC_ERROR             = 'ADD_DOC_ERROR';
export const REMOVE_DOC_BEGIN          = 'REMOVE_DOC_BEGIN';
export const REMOVE_DOC_SUCCESS        = 'REMOVE_DOC_SUCCESS';
export const REMOVE_DOC_ERROR          = 'REMOVE_DOC_ERROR';
export const NEW_EXPERIENCE_CLICKED    = 'NEW_EXPERIENCE_CLICKED';
export const ADD_CERTIFICAT_CLICKED    = 'ADD_CERTIFICAT_CLICKED';
export const ADD_CERTIFICAT_BEGIN      = 'ADD_CERTIFICAT_BEGIN';
export const ADD_CERTIFICAT_SUCCESS    = 'ADD_CERTIFICAT_SUCCESS';
export const UPLOAD_SUCCESS            = 'UPLOAD_SUCCESS';
export const UPLOAD_BEGIN              = 'UPLOAD_BEGIN';
export const EXPAND_PROFIL             = 'EXPAND_PROFIL';
export const UPLOAD_ERROR              = 'UPLOAD_ERROR';
export const MOVE_TO_ADD_NEW_EXP       = 'MOVE_TO_ADD_NEW_EXP';
export const SET_SKILLS                = 'SET_SKILLS';
export const SET_EXPERIENCE_BEGIN      = 'SET_EXPERIENCE_BEGIN';
export const SET_EXPERIENCE_ERROR      = 'SET_EXPERIENCE_ERROR';
export const SET_EXPERIENCE_SUCCESS    = 'SET_EXPERIENCE_SUCCESS';

export const getOrganizationsBegin = () => ({
    type: GET_ORGANIZATIONS_BEGIN
  });

export const getOrganizationsSuccess = (organizations) => ({
    type: GET_ORGANIZATIONS_SUCCESS,
    organizations
});

export const getOrganizationsError = (error) => ({
    type: GET_ORGANIZATIONS_ERROR,
    error
});

export const setExperienceFormInput = (property, value) => ({
    type: SET_EXPERIENCE_FORM_INPUT,
    property,
    value
});

export const addCertificatSuccess = (competencies, formData, confidenceIndex, certificat) => ({
    type: ADD_CERTIFICAT_SUCCESS,
    competencies: competencies,
    formData: formData,
    confidenceIndex: confidenceIndex,
    certificat: certificat
});

export const uploadFileSuccess = () => ({
    type: UPLOAD_SUCCESS
});

export const uploadFileError = () => ({
    type: UPLOAD_ERROR
});

export const uploadFileBegin = () => ({
    type: UPLOAD_BEGIN
});

export const addCertificatBegin = () => ({
    type: ADD_CERTIFICAT_BEGIN
});

export const newExperience = (value) => ({
    type: NEW_EXPERIENCE_CLICKED,
    value
});

export const addCertificat = () => ({
    type: ADD_CERTIFICAT_CLICKED
});

export const addDocBegin = (user, experience) => ({
    type: ADD_DOC_BEGIN,
    user,
    experience
  });

export const addDocSuccess = (user, success) => ({
    type: ADD_DOC_SUCCESS,
    user,
    success
});

export const addDocError = error => ({
    type: ADD_DOC_ERROR,
    error
});

export const removeDocBegin = (user, experience) => ({
    type: REMOVE_DOC_BEGIN,
    user,
    experience
  });

export const removeDocSuccess = (user, success) => ({
    type: REMOVE_DOC_SUCCESS,
    user,
    success
});

export const removeDocError = error => ({
    type: REMOVE_DOC_ERROR,
    error
});

export const setSkills = skills => ({
    type: SET_SKILLS,
    skills
});

export const expandProfil = expandProfil => ({
    type: EXPAND_PROFIL,
    expandProfil
})

export const setExperienceBegin = () => ({
    type: SET_EXPERIENCE_BEGIN
  });

export const setExperienceSuccess = (experience) => ({
    type: SET_EXPERIENCE_SUCCESS,
    experience
});

export const setExperienceError = (error) => ({
    type: SET_EXPERIENCE_ERROR,
    error
});

export function getOrganizations() {
    return dispatch => {
        dispatch(getOrganizationsBegin());
        let organizationService = OrganizationService.getOrganizationService();

        //Try to login
        organizationService.getOrganizations().then(response => {
            
            //if the API send back an error
            if (response.error) 
                dispatch(getOrganizationsError(response.error));
            else
                // if the API send success
                dispatch(getOrganizationsSuccess(response));
        }).catch(error => {
            // if an error is not handle
            dispatch(getOrganizationsError(error));
        });
    };
}

export function setExperience(experience, user) {
    return dispatch => {
        dispatch(setExperienceBegin());
        let experienceService = ExperienceService.getExperienceService();

        //Try to login
        experienceService.add(experience).then(response => {
            
            //if the API send back an error
            if (response.error) 
                dispatch(setExperienceError(response.error));
            else {
                // if the API send success
                dispatch(setExperienceSuccess(response));
                let competencies = [];
                for (let index = 1; index <= 10; index++) {
                    if(response['skill' + index]) {
                        competencies.push(new Competency(response['skill' + index], 0));
                    }
                }
                var experience = new Experience(
                    null,
                    response.job_title,
                    response.job_description,
                    new Date(response.date_start),
                    new Date(response.date_end),
                    competencies,
                    null,
                    null,
                    null,
                    null,
                    'SAVED'
                )
                user.freelancerDatas.experiences.push(experience);
                user.freelancerDatas.getCompetencies().then(() => {
                        dispatch(fetchUserSuccess(user));
                        dispatch({type:'RESET_EXPERIENCE_REDUCER'});
                });
            }
        }).catch(error => {
            // if an error is not handle
            dispatch(setExperienceError(error));
        });
    };
}

export function addDocToFreelancer(user, experience) {
    return dispatch => {
        dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
        dispatch(addDocBegin(user, experience));   
        user.freelancerDatas.addDocument(experience)
        .once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })      
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        })
        .then((success) => {
            experience.docId = FileService.getBytes32FromIpfsHash(experience.docId);
            experience.certificat = "https://gateway.ipfs.io/ipfs/" + FileService.getIpfsHashFromBytes32(experience.docId);
            user.freelancerDatas.experiences.push(experience);
            user.freelancerDatas.getCompetencies().then(() => {
                user.freelancerDatas.getGlobalConfidenceIndex().then(() => {
                    dispatch(addDocSuccess(user, success));
                    dispatch(fetchUserSuccess(user));
                });
            });
        })
        .catch((error) => {
            dispatch(addDocError(error));
        });
    };
}

export function removeDocToFreelancer(user, experience) {
    return dispatch => {
        dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several minutes !"));
        dispatch(removeDocBegin(user, experience));
        user.freelancerDatas.removeDoc(experience)
        .once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        })
        .then((success) => {
            var index = user.freelancerDatas.experiences.indexOf(experience);
            if (index !== -1) {
                user.freelancerDatas.experiences.splice(index, 1);
                user.freelancerDatas.getCompetencies().then(() => {
                    user.freelancerDatas.getGlobalConfidenceIndex().then(() => {
                        dispatch(removeDocSuccess(user, success));
                        dispatch(fetchUserSuccess(user));
                    });
                });
            } else {
                dispatch(removeDocError('No documents to delete.'));
            }
        })
        .catch((error) => {
            dispatch(removeDocError(error));
        });
    };
}

export function newExperienceClicked(value) {
    return dispatch => {
        dispatch(newExperience(value));
    }
}

export function addCertificatClicked(fileInput) {
    return dispatch => {
        fileInput.click();
        dispatch(addCertificat());
    }
}

export function detectCompetenciesFromCertification(event) {
    return dispatch => {
        dispatch(addCertificatBegin());
        let file = event.files[0];
        event.value = null;
        if (typeof file === 'undefined')
            return;

        let competencies = [];
        let certificat = file.name;
        let content;
        let reader = new FileReader();
        reader.onload = function (event) {
            content = event.target.result;
            try {
                var jsonContent = JSON.parse(content);
                Object.keys(jsonContent).forEach(key => {
                    if (key.startsWith("jobSkill")) {
                        if (jsonContent[key] !== "") {
                            //let number = key.substring(8);
                            let competencyName = jsonContent[key];
                            let rating = jsonContent["jobRating2"];// + number];
                            competencies.push(new Competency(competencyName, rating, null, jsonContent.jobDuration)); 
                        }
                    }
                });
                dispatch(addCertificatSuccess(competencies, file, 80, certificat));
            } catch (e) {
                let error = {};
                error.message = 'Invalid JSON';
                dispatch(transactionError(error));
            }
        }
        reader.readAsText(file);
    }
}

export function addDocument(formData, user, experience) {
    return dispatch => {
        dispatch(uploadFileBegin());
        FileService.uploadToIpfs(formData).then(result => {
            //Check if the doc is already uploaded
            let alreadyUploded = false;
            user.freelancerDatas.experiences.forEach(experience => {
                if (FileService.getIpfsHashFromBytes32(experience.docId) === result) {
                    alreadyUploded = true;
                    dispatch(transactionError(new Error('You have already upload this file.')));
                    dispatch(uploadFileError());
                }
            });  
            if (!alreadyUploded) {
                let newExperienceToAdd = new Experience(
                    result,
                    experience.title,
                    experience.description,
                    new Date(experience.from),
                    new Date(experience.to),
                    experience.competencies,
                    experience.certificat,
                    experience.confidenceIndex,
                    experience.type,
                    experience.jobDuration
                );
                dispatch(uploadFileSuccess());
                dispatch(addDocToFreelancer(user, newExperienceToAdd));
            }
        }, err => dispatch(addDocError(err)));
    }
}

export function moveToNewExp(history) {
    return dispatch => {
        dispatch(newExperience(true));
        dispatch(changeMenu('/chronology', false));
        history.push('/chronology');
    }
}