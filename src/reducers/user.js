import {
  FETCH_USER_BEGIN, 
  FETCH_USER_SUCCESS,
  FETCH_USER_FAILURE   
} from '../actions/user'

const initialState = {
  user: null,
  loading: false,
  error: null
};

export default function userReducer(state = initialState, action) {
  switch(action.type) {
    case FETCH_USER_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
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

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}