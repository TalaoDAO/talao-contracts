import { combineReducers } from 'redux';

import userReducer from './public/user';
import transactionReducer from './public/transaction';
import guardReducer from './public/guard';
import homepageReducer from './public/homepage';
import menuReducer from './public/menu';
import snackbarReducer from './public/snackbar';

import createVaultReducer from './freelance/createVault';
import dashboardReducer from './freelance/dashboard';
import experienceReducer from './freelance/experience';

const appReducer = combineReducers({
  userReducer,
  transactionReducer,
  guardReducer,
  homepageReducer,
  menuReducer,
  snackbarReducer,
  createVaultReducer,
  dashboardReducer,
  experienceReducer
});

export const rootReducer = (state, action) => {
  if (action.type === 'RESET_STORE') {
    state = undefined;
  }
  return appReducer(state, action);
}
