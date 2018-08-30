import { transactionHash, transactionReceipt, transactionError, transactionBegin } from '../actions/transactions'

import Experience from '../models/Experience';
import { fetchUserSuccess } from '../actions/user'
import { TEXT_VALIDATOR_LENGTH } from '../actions/createVault';
import Competency from '../models/Competency';
import FileService from '../services/FileService';

export const ADD_DOC_BEGIN          = 'ADD_DOC_BEGIN';
export const ADD_DOC_SUCCESS        = 'ADD_DOC_SUCCESS';
export const ADD_DOC_ERROR          = 'ADD_DOC_ERROR';
export const REMOVE_DOC_BEGIN       = 'REMOVE_DOC_BEGIN';
export const REMOVE_DOC_SUCCESS     = 'REMOVE_DOC_SUCCESS';
export const REMOVE_DOC_ERROR       = 'REMOVE_DOC_ERROR';
export const CHANGE_FROM            = 'CHANGE_FROM';
export const CHANGE_TO              = 'CHANGE_TO';
export const CHANGE_DESCRIPTION_EXP = 'CHANGE_DESCRIPTION_EXP';
export const CHANGE_TITLE_EXP       = 'CHANGE_TITLE_EXP';
export const CHANGE_TYPE            = 'CHANGE_TYPE';
export const NEW_EXPERIENCE_CLICKED = 'NEW_EXPERIENCE_CLICKED';
export const ADD_CERTIFICAT_CLICKED = 'ADD_CERTIFICAT_CLICKED';
export const ADD_CERTIFICAT_BEGIN   = 'ADD_CERTIFICAT_BEGIN';
export const ADD_CERTIFICAT_SUCCESS = 'ADD_CERTIFICAT_SUCCESS';
export const UPLOAD_SUCCESS         = 'UPLOAD_SUCCESS';
export const UPLOAD_BEGIN           = 'UPLOAD_BEGIN';
export const EXPAND_PROFIL          = 'EXPAND_PROFIL';
export const UPLOAD_ERROR           = 'UPLOAD_ERROR'

export const addCertificatSuccess = (competencies, formData, confidenceIndex, certificat) => ({
    type: ADD_CERTIFICAT_SUCCESS,
    competencies: competencies,
    formData: formData,
    confidenceIndex: confidenceIndex,
    certificat: certificat
});

export const uploadFileSuccess = () => ({
    type: UPLOAD_SUCCESS
})

export const uploadFileError = () => ({
    type: UPLOAD_ERROR
})

export const uploadFileBegin = () => ({
    type: UPLOAD_BEGIN
})

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

export const changeFrom = (from, errorEmpty) => ({
    type: CHANGE_FROM,
    from,
    errorEmpty
});

export const changeTo = (to, errorEmpty) => ({
    type: CHANGE_TO,
    to,
    errorEmpty
});

export const changeTitle = (title, error, errorEmpty) => ({
    type: CHANGE_TITLE_EXP,
    title,
    error,
    errorEmpty
});

export const changeType = (typeExp) => ({
    type: CHANGE_TYPE,
    typeExp
});

export const changeDescription = (description) => ({
    type: CHANGE_DESCRIPTION_EXP,
    description
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

export const expandProfil = expandProfil => ({
    type: EXPAND_PROFIL,
    expandProfil
})

export function addDocToFreelancer(user, experience) {
    return dispatch => {
        dispatch(transactionBegin("Your experience is being added..."));
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
                dispatch(addDocSuccess(user, success));
                dispatch(fetchUserSuccess(user));
            });
        })
        .catch((error) => {
            dispatch(addDocError(error));
        });
    };
}

export function removeDocToFreelancer(user, experience) {
    return dispatch => {
        dispatch(transactionBegin("Your experience is being deleted..."));
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
                    dispatch(removeDocSuccess(user, success));
                    dispatch(fetchUserSuccess(user));
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

export function setNewExperienceInput(input, value) {
    return dispatch => {
        switch (input) 
        {
            case 'from': dispatch(changeFrom(value, isEmpty(value))); break;
            case 'to': dispatch(changeTo(value, isEmpty(value))); break;
            case 'title': dispatch(changeTitle(value, !isTextLimitRespected(value), isEmpty(value))); break;
            case 'description': dispatch(changeDescription(value)); break;
            case 'type': dispatch(changeType(value)); break;
            default: break;
        }
    }
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

export function isTextLimitRespected(text) {
    return text.length < TEXT_VALIDATOR_LENGTH;
}

export function isEmpty(text) {
    return text.length <= 0;
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
            var jsonContent = JSON.parse(content);
            Object.keys(jsonContent).forEach(key => {
                if (key.startsWith("jobSkill")) {
                    if (jsonContent[key] !== "") {
                        let number = key.substring(8);
                        let competencyName = jsonContent[key];
                        let rating = jsonContent["jobRating" + number];
                        competencies.push(new Competency(competencyName, rating, null, jsonContent.jobDuration)); 
                    }
                }
            });
            dispatch(addCertificatSuccess(competencies, file, 80, certificat));
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