import {
  FETCH_USER_BEGIN, 
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE,
  FETCH_FREELANCER_BEGIN,
  FETCH_FREELANCER_SUCCESS,
  FETCH_FREELANCER_FAILURE,
  LOGOUT,
  LOGIN
} from '../actions/user'

const initialState = {
  user: null,
  loading: false,
  error: null
};

export default function userReducer(state = initialState, action) {
  switch(action.type) {

    case 'web3/RECEIVE_ACCOUNT':
      return {
        ...state,
        ethAddress: action.address,
        user: null,
        resetAccount: true
      };

    case 'web3/CHANGE_ACCOUNT':
      return {
        ...state,
        ethAddress: action.address,
        user: null,
        resetAccount: true
      };

    case LOGOUT:
      return {
        ...state,
        ethAddress: null,
        user: null,
        resetAccount: true
      };

    case LOGIN:
      return {
        ...state,
        ethAddress: action.address,
        user: null,
        resetAccount: true
      };

    case FETCH_USER_BEGIN:
      return {
        ...state,
        loading: true,
        error: null,
        resetAccount: false
      };

    case FETCH_USER_SUCCESS:
      return {
        ...state,
        loading: false,
        user: Object.assign({}, action.user)
      };

    case FETCH_USER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.error,
        user: null
      };

    case FETCH_FREELANCER_BEGIN:
      return {
        ...state,
        error: null,
        resetAccount: false
      };

    case FETCH_FREELANCER_SUCCESS:
      return {
        ...state,
        user: Object.assign({}, action.user)
      };

    case FETCH_FREELANCER_FAILURE:
      return {
        ...state,
        error: action.error,
        user: null
      };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}