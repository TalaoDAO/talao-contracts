export const SNACKBAR_SET = 'SNACKBAR_SET';
export const SNACKBAR_REMOVE = 'SNACKBAR_REMOVE';

export function setSnackbar(message, type) {
  return dispatch => {
    dispatch({
      type: SNACKBAR_SET,
      snackbar: {
        message: message,
        type: type
      }
    });
  }
}

export function removeSnackbar() {
  return dispatch => {
    dispatch({
      type: SNACKBAR_REMOVE
    });
  }
}
