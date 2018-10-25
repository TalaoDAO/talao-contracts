export const SNACKBAR = 'SNACKBAR';

export function setSnackbar(message, type) {
  return dispatch => {
    dispatch({
      type: SNACKBAR,
      snackbar: {
        message: message,
        type: type
      }
    });
  }
}
