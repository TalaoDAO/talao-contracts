import { transactionHash, transactionReceipt, transactionError, transactionBegin } from '../actions/transactions'
import { fetchUser } from '../actions/user'
import FileService from '../services/FileService';
import { uploadFileBegin, uploadFileSuccess } from '../actions/experience';

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
export const ADD_PICTURE              = 'ADD_PICTURE';
export const ADD_PICTURE_BEGIN        = 'ADD_PICTURE_BEGIN';
export const ADD_PICTURE_SUCCESS      = 'ADD_PICTURE_SUCCESS';
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

export const initVaultDatas = (price, accessPriceSet, step, user) => ({
    type: INIT_VAULT_DATAS,
    price,
    accessPriceSet,
    step,
    user
});

export const addPictureClicked = () => ({
    type: ADD_PICTURE
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

export const addProfilPictureBegin = () => ({
    type: ADD_PICTURE_BEGIN
});

export const addProfilPictureSuccess = (picture, pictureToUpload) => ({
    type: ADD_PICTURE_SUCCESS,
    picture,
    pictureToUpload
});

export function addProfilePicture(event) {
    return dispatch => {

        dispatch(addProfilPictureBegin());
        let profilePicture = event.files[0];

        event.value = null;
        if (typeof profilePicture === 'undefined')
            return;

        let reader = new FileReader();
        reader.onload = function (event) {
            dispatch(addProfilPictureSuccess(event.target.result, profilePicture));
        }
        reader.readAsDataURL(profilePicture); 
    }
};

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
                user.tokenContract.methods.hasVaultAccess(user.ethAddress, user.ethAddress).call().then(accessPriceSet => {
                    //(parseInt(price, 0) !== 0) ? dispatch(initVaultDatas(price, 1, freelancerDatas)) : dispatch(initVaultDatas(0, 0, freelancerDatas));
                    accessPriceSet ? dispatch(initVaultDatas(price, accessPriceSet, 1, freelancerDatas)) : dispatch(initVaultDatas(0, accessPriceSet, 0, freelancerDatas));
                })
            })
        });
    }
}

export function addImageClicked(fileInput) {
    return dispatch => {
        fileInput.click();
        dispatch(addPictureClicked());
    }
}

export function canSwitchStep(step, accessPrice, maxAccessPrice, isAccessPriceSet) {
    return dispatch => {
       /* if (step === 0 || (isAccessPriceCorrect(accessPrice, maxAccessPrice) && isAccessPriceSet))
            dispatch(switchStep(step));*/
            return false;
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
        dispatch(transactionBegin("Your account is being created...this transaction can last several seconds !"));
        let tokens_wei = window.web3.utils.toWei(accessPrice.toString());

        //set the access price
        user.tokenContract.methods.createVaultAccess(tokens_wei).send({ from: user.ethAddress, gasPrice: '5000000000' }
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

export function submitVault(user, accessPrice, fName, lName, titl, description, pho, mail, pictureToUpload) {
    return dispatch => {

        dispatch(uploadFileBegin());
        let pictureUrl;
        FileService.uploadToIpfs(pictureToUpload).then(result => {
            pictureUrl = (pictureToUpload) ? FileService.getBytes32FromIpfsHash(result) : '0x0000000000000000000000000000000000000000';
        }).then(() => {
            dispatch(uploadFileSuccess());

            dispatch(submitVaultBegin());
    
            let firstName = window.web3.utils.fromAscii(fName);
            let lastname = window.web3.utils.fromAscii(lName);
            let phone = window.web3.utils.fromAscii(pho);
            let email = window.web3.utils.fromAscii(mail);
            let title = window.web3.utils.fromAscii(titl);
            let desc = description;
    
            if (user.freelancerDatas) {
                //Update the vault
                dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several seconds !"));
                user.freelancerContract.methods.UpdateFreelancerData(user.ethAddress, firstName, lastname, phone, email, title, desc, pictureUrl).send(
                    {
                        from: user.ethAddress, 
                        gasPrice: '5000000000'
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
                        dispatch(fetchUser(user.ethAddress));
                    }).catch((err) => { 
                        dispatch(submitVaultError(err));
                    });
            } else {
                //Create the vault
                dispatch(transactionBegin("Close your computer, take a coffee...this transaction can last several seconds !"));
                user.vaultFactoryContract.methods.CreateVaultContract(accessPrice, firstName, lastname, phone, email, title, desc, pictureUrl).send(
                    {
                        from: user.ethAddress, 
                        gasPrice: '5000000000'
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
                        dispatch(fetchUser(user.ethAddress));
                    }).catch((err) => { 
                        dispatch(submitVaultError(err));
                    });
            }
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