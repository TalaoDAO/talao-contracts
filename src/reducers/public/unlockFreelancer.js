import {
  UNLOCK_BEGIN,
  UNLOCK_SUCCESS,
  UNLOCK_ERROR
} from '../../actions/public/unlockFreelancer'

const initialState = {
  error: null,
};

export default function transactionReducer(state = initialState, action) {
  switch(action.type) {

    case UNLOCK_BEGIN:
    return {
      ...state
    };

    case UNLOCK_SUCCESS:
    return {
      ...state
    };

    case UNLOCK_ERROR:
    return {
      ...state,
      error: action.error
    };

    default:
    // ALWAYS have a default case in a reducer
    return state;
  }
}
