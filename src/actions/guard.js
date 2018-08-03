import { changeMenu } from '../actions/menu'

export const GUARD_ERROR = 'GUARD_ERROR';
export const GUARD_VALID = 'GUARD_VALID';
export const GUARD_BEGIN = 'GUARD_BEGIN';
export const RESET_GUARD = 'RESET_GUARD';
export const GUARD_REDIRECT = 'GUARD_REDIRECT';

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

export const guardRedirect = (redirectTo) => ({
    type: GUARD_REDIRECT,
    redirectTo
});

export function hasAccess(location, params, user, history) {
    return dispatch => {

        dispatch(guardBegin());
        
        let redirectTo = null;
        //No parameters
        if (!params) {
            switch (location.toLowerCase()) 
            {
                case 'chronology':
                case 'competencies':
                    if (!user.freelancerDatas) {
                        dispatch(guardError('Please create your vault first.'));
                        redirectTo = '/homepage';
                        dispatch(changeMenu(redirectTo));
                    }
                    break;
                case 'unlockfreelancer': 
                    dispatch(guardError('Invalid parameters.'));
                    redirectTo = '/homepage';
                    dispatch(changeMenu(redirectTo));
                    break;
                case 'register': if (!user.ethAddress) {
                    dispatch(guardError('Please log in to an account with a wallet before creating a vault.'));
                    redirectTo = '/homepage';
                    dispatch(changeMenu(redirectTo));
                }
                break; 
                default: redirectTo = '/homepage';
            }
            (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());

        //Parameter invalid
        } else if (!window.web3.utils.isAddress(params)) {
            dispatch(guardError('This address is not a valid ethereum address.'));
            history.push('/homepage');
            dispatch(changeMenu('/homepage'));
        }
        //Valid parameter
        else {
            //The vault price of the freelancer is 0 talao token ??
            let accessPriceIsZeroTalaoToken;
            user.talaoContract.methods.data(params).call().then(info => {
                accessPriceIsZeroTalaoToken = (parseInt(window.web3.utils.fromWei(info.accessPrice), 10) === 0 ) ? true : false;
            }).then(() => {

            //the client doesn't have a wallet
            if (!user.ethAddress) {
                switch (location.toLowerCase()) 
                {
                    case 'chronology':
                    case 'competencies':
                        //if the vault is free : authorize
                        if (!accessPriceIsZeroTalaoToken) {
                            dispatch(guardError('This vault is not free ! Please log in to unlock this freelancer'));  
                            redirectTo = '/homepage';
                            dispatch(changeMenu(redirectTo));
                        }  
                        break;
                    case 'unlockfreelancer': 
                    case 'register':
                        dispatch(guardError('Please log in to an account with a wallet before creating a vault.'));
                        redirectTo = '/homepage';
                        dispatch(changeMenu(redirectTo));
                        break;
                    default: redirectTo = '/homepage';
                }
                (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());

            //The account is log in and the params is correct
            } else {
                //The user is looking for himself
                if (user.ethAddress.toLowerCase() === params.toLowerCase()) {
                    switch (location.toLowerCase()) 
                    {
                        case 'chronology':
                            if (!user.freelancerDatas) {
                                redirectTo = '/homepage';
                                dispatch(guardError('Please create your vault first.'));
                                dispatch(changeMenu(redirectTo));
                            } else {
                                dispatch(guardValid());
                                redirectTo = '/chronology';
                                dispatch(changeMenu(redirectTo));
                            }
                            break;
                        case 'competencies':
                            if (!user.freelancerDatas) {
                                redirectTo = '/homepage';
                                dispatch(guardError('Please create your vault first.'));
                                dispatch(changeMenu(redirectTo));
                            } else {
                                dispatch(guardValid());
                                redirectTo = '/competencies';
                                dispatch(changeMenu(redirectTo));
                            }
                            break;
                        case 'unlockfreelancer':
                            redirectTo = '/homepage';
                            dispatch(guardError('You can\'t unlock yourself.'));
                            dispatch(changeMenu(redirectTo));
                        break
                        case 'register': break;
                        default: redirectTo = '/homepage';
                    }
                    (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());

                //The user is a client looking for a freelancer
                } else {

                    let isPartner = null;
                    let hasVaultAccess = null;
                    let hasVault = null;
                    //Check if user has a vault
                    user.vaultFactoryContract.methods.FreelanceVault(params).call().then(vaultAddress => {
                        hasVault = (vaultAddress === '0x0000000000000000000000000000000000000000') ? false : true;
                    }).then(() => {
                        // This freelancer is a partner ??
                        user.freelancerContract.methods.isPartner(params, user.ethAddress).call().then(partner => {
                            isPartner = partner;
                        }).then(() => {
                            // This client has already unlock the freelancer vault ??
                            user.talaoContract.methods.hasVaultAccess(params, user.ethAddress).call().then(hasAccessToFreelanceVault => {
                                hasVaultAccess = hasAccessToFreelanceVault;
                            }).then(() => {
                                switch (location.toLowerCase()) 
                                {
                                    case 'chronology':
                                    case 'competencies':
                                        if (!hasVault) {
                                            redirectTo = '/homepage';
                                            dispatch(guardError('This freelancer doesn\'t have a vault.'));
                                            dispatch(changeMenu(redirectTo));
                                        } else if (!isPartner && !hasVaultAccess && !accessPriceIsZeroTalaoToken) {
                                            redirectTo = '/unlockfreelancer?' + params;
                                            dispatch(changeMenu('/unlockfreelancer'));
                                        }
                                        break;
                                    case 'unlockfreelancer':
                                        if (!hasVault) {
                                            redirectTo = '/homepage';
                                            dispatch(guardError('This freelancer doesn\'t have a vault.'));
                                            dispatch(changeMenu(redirectTo));
                                        } else if (isPartner || hasVaultAccess || accessPriceIsZeroTalaoToken) {
                                            redirectTo = '/chronology?' + params;
                                            dispatch(changeMenu('/chronology'));
                                        }
                                        break
                                    case 'register':
                                        redirectTo = '/homepage';
                                        dispatch(changeMenu(redirectTo));
                                        dispatch(guardError('You can\'t edit this vault.'));
                                        break;
                                    default: redirectTo = '/homepage';
                                }
                                (redirectTo) ? history.push(redirectTo) : dispatch(guardValid());
                            });
                        });
                    });
                }
                }
            });
        }
    }
}