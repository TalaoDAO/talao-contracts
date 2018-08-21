import {
    CREATE_VAULT_BEGIN,
    INIT_VAULT_DEPOSIT,
    CREATE_VAULT_ERROR,
    INIT_VAULT_DATAS,
    SWITCH_STEP,
    CHANGE_ACCESS_PRICE,
    CHANGE_FIRST_NAME,
    CHANGE_LAST_NAME,
    CHANGE_DESCRIPTION,
    CHANGE_TITLE,
    CHANGE_MAIL,
    CHANGE_PHONE,
    SET_ACCESS_PRICE_BEGIN,
    SET_ACCESS_PRICE_SUCCESS,
    SET_ACCESS_PRICE_ERROR,
    SUBMIT_VAULT_BEGIN,
    SUBMIT_VAULT_SUCCESS,
    SUBMIT_VAULT_ERROR,
    RESET_REDIRECT
  } from '../actions/createVault'
  
  const initialState = {
      step: 0,
      accessPrice: '',
      accessPriceSet: false,
      firstName: '',
      firstNameError: false,
      firstNameEmpty: true,
      lastName: '',
      lastNameError: false,
      lastNameEmpty: true,
      title: '',
      titleError: false,
      titleEmpty: true,
      description: '',
      descriptionError: false,
      mail: '',
      mailError: false,
      phone: '',
      phoneError: false,
      vaultMaxAccessPrice: 0,
      accessPriceError: false,
      maxAccessPricePlaceholder : '',
      isAccessPriceSet: false,
      error: null,
      helperTextTooLong: 'Maximum length: 30 characters',
      helperIncorrectMail: 'This is not a valid email address',
      helperIncorrectPhoneNumber: 'This is not a valid phone number'
  };
  
  export default function createVaultReducer(state = initialState, action) {
    switch(action.type) {
      case CREATE_VAULT_BEGIN:
        return {
          ...state,
          step: 0,
          accessPrice: '',
          accessPriceSet: false,
          firstName: '',
          firstNameError: false,
          firstNameEmpty: true,
          lastName: '',
          lastNameError: false,
          lastNameEmpty: true,
          title: '',
          titleError: false,
          titleEmpty: true,
          description: '',
          mail: '',
          mailEmpty: true,
          mailError: false,
          phone: '',
          phoneEmpty: true,
          phoneError: false,
          vaultMaxAccessPrice: 0,
          accessPriceError: false,
          maxAccessPricePlaceholder: '',
          isAccessPriceSet: false,
          error: null,
          helperTextTooLong: 'Maximum length: 30 characters',
          helperTextEmpty: 'This field is required',
          helperIncorrectMail: 'This is not a valid email address',
          helperIncorrectPhoneNumber: 'This is not a valid phone number'
        };

      case INIT_VAULT_DEPOSIT:
        return {
          ...state,
          vaultMaxAccessPrice: action.vaultMaxAccessPrice,
          maxAccessPricePlaceholder: action.maxAccessPricePlaceholder
        };
        
      case INIT_VAULT_DATAS:
        return {
          ...state,
          accessPrice: action.price,
          isAccessPriceSet: action.accessPriceSet,
          step: action.step,
          firstName: (action.user) ? action.user.firstName : '',
          lastName: (action.user) ? action.user.lastName : '',
          title: (action.user) ? action.user.title : '',
          description: (action.user) ? action.user.description : '',
          mail: (action.user) ? action.user.email : '',
          mailError: (action.user && action.user.email.length > 0) ? false : true,
          phone: (action.user) ? action.user.phone : '',
          phoneError: (action.user && action.user.phone.length > 0) ? false : true,
          firstNameEmpty: (action.user && action.user.firstName.length > 0) ? false : true,
          lastNameEmpty: (action.user && action.user.lastName.length > 0) ? false : true,
          titleEmpty: (action.user && action.user.title.length > 0) ? false : true,
        };

      case CREATE_VAULT_ERROR:
        return {
          ...state,
          error: action.error
        };

      case SWITCH_STEP:
        return {
          ...state,
          step: action.step
        };

      case CHANGE_ACCESS_PRICE:
        return {
          ...state,
          accessPrice: action.price,
          accessPriceError: action.error,
          accessPriceDirty: true
        };

      case CHANGE_FIRST_NAME:
        return {
          ...state,
          firstName: action.firstName,
          firstNameError: action.error,
          firstNameEmpty: action.errorEmpty
        };

      case CHANGE_LAST_NAME:
        return {
          ...state,
          lastName: action.lastName,
          lastNameError: action.error,
          lastNameEmpty: action.errorEmpty
      };

      case CHANGE_DESCRIPTION:
        return {
          ...state,
          description: action.description
        };

      case CHANGE_TITLE:
        return {
          ...state,
          title: action.title,
          titleError: action.error,
          titleEmpty: action.errorEmpty
      };

      case CHANGE_MAIL:
        return {
          ...state,
          mail: action.mail,
          mailError: action.error
        };

      case CHANGE_PHONE:
        return {
          ...state,
          phone: action.phone,
          phoneError: action.error
      };

      case SET_ACCESS_PRICE_BEGIN:
        return {
          ...state
        };

      case SET_ACCESS_PRICE_SUCCESS:
        return {
          ...state,
          isAccessPriceSet: true,
          step: 1
        };

      case SET_ACCESS_PRICE_ERROR:
        return {
          ...state,
          error: action.error
        };

      case SUBMIT_VAULT_BEGIN:
        return {
          ...state
        };

      case SUBMIT_VAULT_SUCCESS:
        return {
          ...state,
          redirectTo: '/chronology'
        };

      case SUBMIT_VAULT_ERROR:
        return {
          ...state,
          error: action.error
        };

      case RESET_REDIRECT:
        return {
          ...state,
          redirectTo: null
        };
      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }