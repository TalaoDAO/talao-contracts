import store from '../store/store';

export default class AuthHelper {

  static setHeaders() {
    const storeState = store.getState();
    const userReducer = storeState.userReducer;
    const { auth } = userReducer;
    const { freelancerAddress, freelancerVaultAddress } = auth;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.stringify({
        ethereumAddress: freelancerAddress,
        vaultAddress: freelancerVaultAddress
      })
    }
    return headers;
  }

}
