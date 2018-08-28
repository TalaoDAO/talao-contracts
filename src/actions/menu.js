import { resetGuard } from '../actions/guard'
export const REDIRECT     = 'REDIRECT';


export const changeMenu = selectedMenu => ({
    type: REDIRECT,
    selectedMenu
  });

export function changeMenuClicked(address, reset) {
    return dispatch => {
        dispatch(changeMenu(address));
        if (reset) {
            dispatch(resetGuard());
        }
    }
}