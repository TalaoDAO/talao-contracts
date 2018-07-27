import { combineReducers } from 'redux';
import userReducer from './user';
import createVaultReducer from './createVault';
import transactionReducer from './transactions';
import experienceReducer from './experience';

export default combineReducers({
    userReducer,
    createVaultReducer,
    transactionReducer,
    experienceReducer
});