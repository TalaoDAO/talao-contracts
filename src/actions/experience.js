import {
    transactionHash, 
    transactionReceipt,
    transactionError,           
  } from '../actions/transactions'

import {
    fetchUserBegin,
    fetchUserSuccess
} from '../actions/user'

export const ADD_DOC_BEGIN      = 'ADD_DOC_BEGIN';
export const ADD_DOC_SUCCESS    = 'ADD_DOC_SUCCESS';
export const ADD_DOC_ERROR      = 'ADD_DOC_ERROR';
export const REMOVE_DOC_BEGIN   = 'REMOVE_DOC_BEGIN';
export const REMOVE_DOC_SUCCESS = 'REMOVE_DOC_SUCCESS';
export const REMOVE_DOC_ERROR   = 'REMOVE_DOC_ERROR';

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

export function addDocToFreelancer(user, experience) {
    return dispatch => {
        dispatch(addDocBegin(user, experience));   
        dispatch(fetchUserBegin());   
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
            user.freelancerDatas.experiences.push(experience);
            dispatch(addDocSuccess(user, success));
            dispatch(fetchUserSuccess(user));
        })
        .catch((error) => {
            dispatch(addDocError(error));
        });
    };
}

export function removeDocToFreelancer(user, experience) {
    return dispatch => {
        dispatch(removeDocBegin(user, experience));
        dispatch(fetchUserBegin());
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
                dispatch(removeDocSuccess(user, success));
                dispatch(fetchUserSuccess(user));
            } else {
                dispatch(removeDocError('No documents to delete.'));
            }
        })
        .catch((error) => {
            dispatch(removeDocError(error));
        });
    };
}