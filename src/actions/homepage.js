import { changeMenu } from './menu'

export const FREELANCER_ADDRESS_CHANGE = 'FREELANCER_ADDRESS_CHANGE';
export const GOTO_CREATE_VAULT = 'GOTO_CREATE_VAULT';
export const GOTO_FREELANCER = 'GOTO_FREELANCER';

export const freelancerAddressChange = (address, error, errorEmpty) => ({
    type: FREELANCER_ADDRESS_CHANGE,
    address,
    error,
    errorEmpty
});

export const gotoCreateVault = () => ({
    type: GOTO_CREATE_VAULT
});

export const gotoFreelancer = () => ({
    type: GOTO_FREELANCER
});

export function setFreelancerAddress(text) {
    return dispatch => {
        dispatch(freelancerAddressChange(text, isInvalidEthereumAddress(text), isEmpty(text)));
    }
}

export function isEmpty(text) {
    return text.length <= 0;
}

export function isInvalidEthereumAddress(text) {
    return !window.web3.utils.isAddress(text)
}

export function createVaultClicked(history) {
    return dispatch => {
        dispatch(changeMenu('/register'));
        dispatch(gotoCreateVault());
        history.push('/register');
    }
}

export function searchFreelancerClicked(history, address) {
    return dispatch => {
        dispatch(changeMenu('/chronology'));
        dispatch(gotoFreelancer());
        history.push('/chronology?' + address);
    }
}