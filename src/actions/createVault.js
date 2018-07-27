import { transactionHash, transactionReceipt, transactionError } from '../actions/transactions'
import { fetchUser } from '../actions/user'

export const CREATE_VAULT_BEGIN       = 'CREATE_VAULT_BEGIN';
export const INIT_VAULT_DEPOSIT       = 'INIT_VAULT_DEPOSIT';
export const CREATE_VAULT_ERROR       = 'CREATE_VAULT_BEGIN';
export const INIT_VAULT_DATAS         = 'INIT_VAULT_DATAS';
export const SWITCH_STEP              = 'SWITCH_STEP';
export const CHANGE_ACCESS_PRICE      = 'CHANGE_ACCESS_PRICE';
export const CHANGE_FIRST_NAME        = 'CHANGE_FIRST_NAME';
export const CHANGE_LAST_NAME         = 'CHANGE_LAST_NAME';
export const CHANGE_DESCRIPTION       = 'CHANGE_DESCRIPTION';
export const CHANGE_TITLE             = 'CHANGE_TITLE';
export const CHANGE_MAIL              = 'CHANGE_MAIL';
export const CHANGE_PHONE             = 'CHANGE_PHONE';
export const SET_ACCESS_PRICE_BEGIN   = 'SET_ACCESS_PRICE_BEGIN';
export const SET_ACCESS_PRICE_SUCCESS = 'SET_ACCESS_PRICE_SUCCESS';
export const SET_ACCESS_PRICE_ERROR   = 'SET_ACCESS_PRICE_ERROR';
export const SUBMIT_VAULT_BEGIN       = 'SUBMIT_VAULT_BEGIN';
export const SUBMIT_VAULT_SUCCESS     = 'SUBMIT_VAULT_SUCCESS';
export const SUBMIT_VAULT_ERROR       = 'SUBMIT_VAULT_ERROR';
export const TEXT_VALIDATOR_LENGTH    = 30;

export const createVaultBegin = () => ({
    type: CREATE_VAULT_BEGIN
});

export const submitVaultBegin = () => ({
    type: SUBMIT_VAULT_BEGIN
});

export const submitVaultSuccess = () => ({
    type: SUBMIT_VAULT_SUCCESS
});

export const submitVaultError = () => ({
    type: SUBMIT_VAULT_ERROR
});

export const createVaultError = (error) => ({
    type: CREATE_VAULT_ERROR,
    error
});

export const initVaultDatas = (price, step, user) => ({
    type: INIT_VAULT_DATAS,
    price,
    step,
    user
});

export const changeAccessPrice = (price, error) => ({
    type: CHANGE_ACCESS_PRICE,
    price,
    error
});

export const changeFirstName = (firstName, error, errorEmpty) => ({
    type: CHANGE_FIRST_NAME,
    firstName,
    error,
    errorEmpty
});

export const changeLastName = (lastName, error, errorEmpty) => ({
    type: CHANGE_LAST_NAME,
    lastName,
    error,
    errorEmpty
});

export const changeTitle = (title, error, errorEmpty) => ({
    type: CHANGE_TITLE,
    title,
    error,
    errorEmpty
});

export const changeDescription = (description) => ({
    type: CHANGE_DESCRIPTION,
    description
});

export const changeMail = (mail, error) => ({
    type: CHANGE_MAIL,
    mail,
    error
});

export const changePhone = (phone, error) => ({
    type: CHANGE_PHONE,
    phone,
    error
});

export const switchStep = (step) => ({
    type: SWITCH_STEP,
    step
});

export const initVaultDeposit = (vaultMaxAccessPrice, maxAccessPricePlaceholder) => ({
    type: INIT_VAULT_DEPOSIT,
    vaultMaxAccessPrice,
    maxAccessPricePlaceholder
});

export const setAccessPriceBegin = () => ({
    type: SET_ACCESS_PRICE_BEGIN
});

export const setAccessPriceSuccess = () => ({
    type: SET_ACCESS_PRICE_SUCCESS
});

export const setAccessPriceError = (error) => ({
    type: SET_ACCESS_PRICE_ERROR,
    error
});

export function initVaultCreation(user) {
    return dispatch => {
        dispatch(createVaultBegin(user));

        // Get vault deposit.
        user.tokenContract.methods.vaultDeposit().call((err, vaultDepositWei) => {
            if (err) {
                dispatch(createVaultError(err));
            }
            else {
                let vaultMaxAccessPrice = window.web3.utils.fromWei(vaultDepositWei);
                let maxAccessPricePlaceholder = "Your price should be between 0 (free) and " + vaultMaxAccessPrice.toString();
                dispatch(initVaultDeposit(vaultMaxAccessPrice, maxAccessPricePlaceholder));
            }
        }).then(() => {
            user.tokenContract.methods.data(user.ethAddress).call().then(info => {
                let price = window.web3.utils.fromWei(info.accessPrice);
                let freelancerDatas = user.freelancerDatas !== null ? user.freelancerDatas : null;
                (parseInt(price, 0) !== 0) ? dispatch(initVaultDatas(price, 1, freelancerDatas)) : dispatch(initVaultDatas(0, 0, freelancerDatas));
            })
        });
    }
}

export function canSwitchStep(step, accessPrice, maxAccessPrice) {
    return dispatch => {
        if (isAccessPriceCorrect(accessPrice, maxAccessPrice))
            dispatch(switchStep(step));
    }
}

export function accessPriceChange(price, maxAccessPrice) {
    return dispatch => {
        isAccessPriceCorrect(price, maxAccessPrice) ? dispatch(changeAccessPrice(price, false)) : dispatch(changeAccessPrice(price, true));
    }
}

export function isAccessPriceCorrect(accessPrice, maxAccessPrice) {
    return (accessPrice >= 0 && accessPrice <= parseInt(maxAccessPrice, 10) && accessPrice % 1 === 0 && accessPrice !== '');
}

export function setAccessPrice(accessPrice, user) {
    return dispatch => {
        dispatch(setAccessPriceBegin());
        let tokens_wei = window.web3.utils.toWei(accessPrice);
        user.tokenContract.methods.createVaultAccess(tokens_wei).send({ from: user.ethAddress }
        ).once('transactionHash', (hash) => { 
            dispatch(transactionHash(hash));
        })
        .once('receipt', (receipt) => { 
            dispatch(transactionReceipt(receipt));
        })
        .on('error', (error) => { 
            dispatch(transactionError(error));
        }).then(() => {
            dispatch(setAccessPriceSuccess());
        }).catch((err) => { 
            dispatch(setAccessPriceError(err));
        });
    }
}

export function submitVault(user, accessPrice, fName, lName, titl, description, pho, mail) {
    return dispatch => {
        dispatch(submitVaultBegin())
        let firstName = window.web3.utils.fromAscii(fName);
        let lastname = window.web3.utils.fromAscii(lName);
        let phone = window.web3.utils.fromAscii(pho);
        let email = window.web3.utils.fromAscii(mail);
        let title = window.web3.utils.fromAscii(titl);
        let desc = description;
        user.vaultFactoryContract.methods.CreateVaultContract(accessPrice, firstName, lastname, phone, email, title, desc).send(
            {
                from: user.ethAddress
            }).once('transactionHash', (hash) => { 
                dispatch(transactionHash(hash));
            })
            .once('receipt', (receipt) => { 
                dispatch(transactionReceipt(receipt));
            })
            .on('error', (error) => { 
                dispatch(transactionError(error));
            }).then(() => {
                dispatch(submitVaultSuccess());
                dispatch(fetchUser());
            }).catch((err) => { 
                dispatch(submitVaultError(err));
            });
    }
}

export function setVaultInput(input, value) {
    return dispatch => {
        switch (input) 
        {
            case 'firstName': dispatch(changeFirstName(value, !isTextLimitRespected(value), isEmpty(value))); break;
            case 'lastName': dispatch(changeLastName(value, !isTextLimitRespected(value), isEmpty(value))); break;
            case 'title': dispatch(changeTitle(value, !isTextLimitRespected(value), isEmpty(value))); break;
            case 'description': dispatch(changeDescription(value)); break;
            case 'mail': dispatch(changeMail(value, !isValidMail(value))); break;
            case 'phone': dispatch(changePhone(value, !isValidPhoneNumber(value))); break;
            default: break;
        }
    }
}

export function isTextLimitRespected(text) {
    return text.length < TEXT_VALIDATOR_LENGTH;
}

export function isEmpty(text) {
    return text.length <= 0;
}

export function isValidMail(mail) {
    var mailRegex = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return mail.match(mailRegex);
}

export function isValidPhoneNumber(phoneNumber) {
    var phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/im;
    return phoneNumber.match(phoneRegex);
}