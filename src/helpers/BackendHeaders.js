import store from '../store/store';

export default class BackendHeaders {
  static setBackendHeaders() {
    const storeState = store.getState();
    const userReducer = storeState.userReducer;
    const { user } = userReducer;
    const { freelancerDatas } = user;
    const { ethereumAddress, vaultAddress } = freelancerDatas;
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': JSON.stringify({
        ethereumAddress,
        vaultAddress
      })
    }
    return headers;
  }
}
