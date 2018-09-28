import { combineReducers } from 'redux';
import userReducer from './user';
import createVaultReducer from './createVault';
import transactionReducer from './transactions';
import experienceReducer from './experience';
import guardReducer from './guard';
import homepageReducer from './homepage';
import menuReducer from './menu'
import dashboardReducer from './dashboard'

const appReducer = combineReducers({
    userReducer,
    createVaultReducer,
    transactionReducer,
    experienceReducer,
    guardReducer,
    homepageReducer,
    menuReducer,
    dashboardReducer
});

export const rootReducer = (state, action) => {
    //Reset all the datas if needed
    if (action.type === 'RESET_STORE') {
      state = undefined
    }
  
    return appReducer(state, action)
  }