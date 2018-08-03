import { combineReducers } from 'redux';
import userReducer from './user';
import createVaultReducer from './createVault';
import transactionReducer from './transactions';
import experienceReducer from './experience';
import guardReducer from './guard';
import homepageReducer from './homepage';
import menuReducer from './menu'

export default combineReducers({
    userReducer,
    createVaultReducer,
    transactionReducer,
    experienceReducer,
    guardReducer,
    homepageReducer,
    menuReducer
});