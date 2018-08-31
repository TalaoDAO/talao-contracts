import { changeMenuClicked, changeMenu } from '../actions/menu'

export const GUARD_ERROR = 'GUARD_ERROR';
export const GUARD_VALID = 'GUARD_VALID';
export const GUARD_BEGIN = 'GUARD_BEGIN';
export const RESET_GUARD = 'RESET_GUARD';

export const guardBegin = () => ({
    type: GUARD_BEGIN
});

export const guardValid = () => ({
    type: GUARD_VALID
});

export const guardError = (message) => ({
    type: GUARD_ERROR,
    message
});

export const resetGuard = () => ({
    type: RESET_GUARD
});

export function hasAccess(location, params, user, history) {
    return dispatch => {

        dispatch(guardBegin());
        
        let redirectTo = null;
        //No parameters in the url
        if (!params) {
            switch (location.toLowerCase()) 
            {
                case 'chronology':
                case 'competencies':
                    if (!user.freelancerDatas)
                        redirectTo = guardHasError(dispatch, 'Please create your vault first.', '/homepage');
                    break;
                case 'unlockfreelancer': 
                    redirectTo = guardHasError(dispatch, 'Invalid parameters.', '/homepage');
                    break;
                case 'register': 
                    if (!user.ethAddress)
                        redirectTo = guardHasError(dispatch, 'Please log in to an account with a wallet before creating a vault.', '/homepage');
                break; 
                default: redirectTo = '/homepage';
            }
            //if no redirection, the user is authorize
            (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());

        //Url Parameter invalid
        } else if (!window.web3.utils.isAddress(params)) {
            redirectTo = guardHasError(dispatch, 'This address is not a valid ethereum address.', '/homepage');
            history.push(redirectTo);
        }

        //Valid parameter
        else {

            //Check if the searchedFreelancer is a freelancer
            userHasAccessToFreelancer(user, params).then((resolve, reject) => {
            let hasVault = (!resolve) ? false : true;
            let userHasAccess = (!resolve || resolve === '0x0000000000000000000000000000000000000000') ? false : true;
            //the client doesn't have a wallet
            if (!user.ethAddress) {
                switch (location.toLowerCase()) 
                {
                    case 'chronology':
                    case 'competencies':
                        //if the vault is free : authorize
                        if (!userHasAccess)
                            redirectTo = guardHasError(dispatch, 'This vault is not free ! Please log in to unlock this freelancer', '/homepage');         
                        break;
                    case 'unlockfreelancer': 
                    case 'register':
                        redirectTo = guardHasError(dispatch, 'Please log in to an account with a wallet.', '/homepage');  
                        break;
                    default: redirectTo = '/homepage';
                }
                //if no redirection, the user is authorize
                (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());

            //The account is log in and the params is correct
            } else {
                //The user is looking for himself
                if (user.ethAddress.toLowerCase() === params.toLowerCase()) {
                    switch (location.toLowerCase()) 
                    {
                        case 'chronology':
                            if (!user.freelancerDatas) {
                                redirectTo = guardHasError(dispatch, 'Please create your vault first.', '/homepage');  
                            } else {
                                dispatch(guardValid());
                                //force the url redirection to remove the url params
                                redirectTo = '/chronology';
                                dispatch(changeMenu(redirectTo));
                            }
                            break;
                        case 'competencies':
                            if (!user.freelancerDatas) {
                                redirectTo = guardHasError(dispatch, 'Please create your vault first.', '/homepage');  
                            } else {
                                //force the url redirection to remove the url params
                                dispatch(guardValid());
                                redirectTo = '/competencies';
                                dispatch(changeMenu(redirectTo));
                            }
                            break;
                        case 'unlockfreelancer':
                            redirectTo = guardHasError(dispatch, 'You can\'t unlock yourself.', '/homepage');  
                            break
                        case 'register': 
                            break;
                        default: redirectTo = '/homepage';
                    }
                    //if no redirection, the user is authorize
                    (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());

                //The user is a client looking for a freelancer
                } else {
                    switch (location.toLowerCase()) 
                    {
                        case 'chronology':
                        case 'competencies':
                            if (!hasVault) {
                                redirectTo = guardHasError(dispatch, 'This freelancer doesn\'t have a vault.', '/homepage');         
                            } else if (!userHasAccess) {
                                //Access needed, so redirect to unlockfreelancer
                                redirectTo = '/unlockfreelancer?' + params;
                                dispatch(changeMenu('/unlockfreelancer'));
                            }
                            break;
                        case 'unlockfreelancer':
                            if (!hasVault) {
                                redirectTo = guardHasError(dispatch, 'This freelancer doesn\'t have a vault.', '/homepage');      
                            } else if (userHasAccess) {
                                //The user has access, so redirect him directly on the chronology of the searchedfreelancer
                                redirectTo = '/chronology?' + params;
                                dispatch(changeMenu('/chronology'));
                            }
                            break
                        case 'register':
                            redirectTo = guardHasError(dispatch, 'You can\'t edit this vault.', '/homepage');      
                            break;
                        default: redirectTo = '/homepage';
                    }
                    (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());
                }
            }});
        }
    }
}

export function guardHasError(dispatch, message, redirection) {
    dispatch(guardError(message));
    dispatch(changeMenuClicked(redirection, false));
    return redirection;
}

export function userHasAccessToFreelancer(user, freelancer) {
    return new Promise((resolve, reject) => {
        user.vaultFactoryContract.methods.HasVault(freelancer).call().then(hasVault => {
            if (hasVault) {
                user.vaultFactoryContract.methods.GetVault(freelancer).call({from: user.ethAddress}).then(vaultAddress => {
                    resolve(vaultAddress);
                });
            } else {
                resolve(false);
            }
        }).catch((err) => {
            reject(err);
        });
    });
}
