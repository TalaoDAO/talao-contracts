import { SNACKBAR_SET, SNACKBAR_REMOVE } from '../../actions/public/snackbar';

const initialState = {
  snackbar: null
};

export default function snackbarReducer(state = initialState, action) {
  switch (action.type) {
    case SNACKBAR_SET:
    return {
      ...state,
      snackbar: action.snackbar
    };
    case SNACKBAR_REMOVE:
    return {
      ...state,
      snackbar: null
    };
    default:
    return state;
  }
}
