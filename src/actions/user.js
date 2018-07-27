import User from "../models/User";
import Freelancer from "../models/Freelancer";

export const FETCH_USER_BEGIN   = 'FETCH_USER_BEGIN';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_FAILURE = 'FETCH_USER_FAILURE';
export const USER_CHANGE = 'USER_CHANGE';

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

//User fetch
export function fetchUser() {
    return dispatch => {
        //Fetch freelancer datas begin
        dispatch(fetchUserBegin());
            //user initialisation
            let user = new User();
            //check if the user is a freelancer
            user.isFreelancer().then((resolve, reject) => {
                //if error, log
                if (reject) {
                    dispatch(fetchUserError(reject))
                }
                //the user is a freelancer so we init his datas
                else if (resolve !== false) {
                    user.freelancerDatas = new Freelancer(user.vaultAddress, user.ethAddress);

                    //subscribe to the adddocevent
                    user.freelancerDatas.eventAddDocumentSubscription().then((resolve) => {
                        if (resolve) {
                            //get the freelancer data
                            user.freelancerDatas.getFreelanceData().then((resolve, reject) => {
                                if (reject) {
                                    dispatch(fetchUserError(reject))
                                }
                                //get all documents & competencies
                                if (resolve) {
                                    user.freelancerDatas.getAllDocuments().then((resolve) => {
                                        if (resolve) {      
                                            //User is a freelancer                                                              
                                            dispatch(fetchUserSuccess(user));
                                        }
                                    })
                                }
                            });
                        }
                    });
                } else {
                    //User is a client
                    dispatch(fetchUserSuccess(user));
                }
            })
            //catch any error incoming
            .catch(error => dispatch(fetchUserError(error)));
    };
}
