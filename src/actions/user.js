import User from "../models/User";
import Freelancer from "../models/Freelancer";
import { resetGuard } from './guard';

export const FETCH_USER_BEGIN         = 'FETCH_USER_BEGIN';
export const FETCH_USER_SUCCESS       = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE       = 'FETCH_USER_FAILURE';
export const FETCH_FREELANCER_BEGIN   = 'FETCH_FREELANCER_BEGIN';
export const FETCH_FREELANCER_SUCCESS = 'FETCH_FREELANCER_SUCCESS';
export const FETCH_FREELANCER_FAILURE = 'FETCH_FREELANCER_FAILURE';
export const LOGOUT                   = 'web3/LOGOUT';
export const LOGIN                    = 'web3/LOGIN'
export const REMOVE_RESEARCH          = 'REMOVE_RESEARCH'

export const logout = () => ({
    type: LOGOUT
});

export const removeResearch = (user) => ({
    type: REMOVE_RESEARCH,
    user
});

export const login = address => ({
    type: LOGIN,
    address: address.toLowerCase()
});

export const fetchUserBegin = () => ({
    type: FETCH_USER_BEGIN
});

export const fetchUserSuccess = user => ({
    type: FETCH_USER_SUCCESS,
    user
});

export const fetchUserError = error => ({
    type: FETCH_USER_FAILURE,
    error
});

export const fetchFreelancerBegin = () => ({
    type: FETCH_FREELANCER_BEGIN
});

  export const fetchFreelancerSuccess = user => ({
    type: FETCH_FREELANCER_SUCCESS,
    user
});

export const fetchFreelancerError = error => ({
    type: FETCH_FREELANCER_FAILURE,
    error
});

//User fetch
export function fetchUser(address) {
    return dispatch => {
        //Fetch freelancer datas begin
        dispatch(fetchUserBegin());

            //user initialisation
            let user = new User(address);

            if (user.ethAddress) {

                //Get the balance of the user
                user.tokenContract.methods.balanceOf(user.ethAddress).call().then(result => {
                    user.talaoBalance = window.web3.utils.fromWei(result);

                    //check if the user is a freelancer
                    user.isFreelancer().then((resolve, reject) => {

                        //if error, log
                        if (reject) {
                            dispatch(fetchUserError(reject))
                        }
                        // The user is a freelancer so we init his datas.
                        // Resolve is his Vault address.
                        else if (resolve !== false) {
                            user.freelancerDatas = new Freelancer(resolve, user.ethAddress);

                                user.freelancerDatas.getFreelanceData().then((resolve, reject) => {
                                    if (reject) {
                                        dispatch(fetchUserError(reject))
                                    }
                                    if (resolve) {
                                        //get docs from the backend
                                        user.freelancerDatas.getAllDraftDocumentsFromBackend().then(resolve => {
                                            if (resolve) {
                                                //get docs from blockchain
                                                user.freelancerDatas.getAllDocsId().then(resolve => {
                                                    if (resolve) {
                                                        user.freelancerDatas.getAllDocuments(resolve).then(resolve => {
                                                            if (resolve) {
                                                                //User is a freelancer
                                                                user.freelancerDatas.getCompetencies().then(resolve => {
                                                                    if (resolve) {
                                                                        user.freelancerDatas.getGlobalConfidenceIndex().then(resolve => {
                                                                            if (resolve) {
                                                                                dispatch(fetchUserSuccess(user));
                                                                                dispatch(resetGuard());
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                        } else {
                            //User is a client with an ethAddress!
                            dispatch(fetchUserSuccess(user));
                            dispatch(resetGuard());
                        }
                    })
                    //catch any error incoming
                    .catch(error => dispatch(fetchUserError(error)));
                });
            } else {
                //User is a client without an ethAddress!
                dispatch(fetchUserSuccess(user));
                dispatch(resetGuard());
            }
    };
}

//User fetch
export function fetchFreelancer(currentUser, searchedFreelancerAddress) {
    return dispatch => {

        //Fetch freelancer datas begin
        dispatch(fetchFreelancerBegin());
        let user = new User(searchedFreelancerAddress);
        //check if the user is a freelancer
        user.isFreelancer().then((resolve, reject) => {
            //if error, log
            if (reject) {
                dispatch(fetchFreelancerError(reject))
            }
            else if (resolve) {
                currentUser.searchedFreelancers = new Freelancer(resolve, searchedFreelancerAddress);
                currentUser.searchedFreelancers.getFreelanceData().then((resolve, reject) => {
                    if (reject) {
                        dispatch(fetchFreelancerError(reject))
                    }
                    //get all documents & competencies
                    if (resolve) {
                        //get the access price
                        currentUser.talaoContract.methods.data(searchedFreelancerAddress).call().then(info => {
                            currentUser.searchedFreelancers.accessPrice = window.web3.utils.fromWei(info.accessPrice);
                            // Get documents index.
                            currentUser.searchedFreelancers.getAllDocsId().then(docsId => {
                              // Get all documents.
                              currentUser.searchedFreelancers.getAllDocuments(docsId).then((resolve) => {
                                  if (resolve) {
                                    // Competencies & Confidence index.
                                    currentUser.searchedFreelancers.getCompetencies().then(resolve => {
                                        if (resolve) {
                                            currentUser.searchedFreelancers.getGlobalConfidenceIndex().then(resolve => {
                                                if (resolve) {
                                                    dispatch(fetchUserSuccess(currentUser));
                                                    dispatch(resetGuard());
                                                }
                                            });
                                        }
                                    });
                                  }
                              })
                            })
                        });
                    }
                });
            }
        })
        //catch any error incoming
        .catch(error => dispatch(fetchFreelancerError(error)));
    };
}
