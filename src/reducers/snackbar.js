import { SNACKBAR } from '../actions/snackbar';

const initialState = {
  snackbar: null
};

export default function snackbarReducer(state = initialState, action) {
  switch (action.type) {
    case SNACKBAR:
      return {
        ...state,
        snackbar: action.snackbar
      };
    default:
      return state;
  }
}
