import store from '../store/store';

export default class AuthHelper {

  static setHeaders() {
    const storeState = store.getState();
    const userReducer = storeState.userReducer;
    const { user } = userReducer;
    const { ethAddress, vaultAddress } = user;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.stringify({
        ethereumAddress: ethAddress,
        vaultAddress
      })
    }
    return headers;
  }

}
