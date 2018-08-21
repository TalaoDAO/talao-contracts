import { resetGuard } from '../actions/guard'
export const CHANGE_MENU_SELECTED     = 'CHANGE_MENU_SELECTED';


export const changeMenu = selectedMenu => ({
    type: CHANGE_MENU_SELECTED,
    selectedMenu
  });

export function changeMenuClicked(address) {
    return dispatch => {
        dispatch(changeMenu(address));
        dispatch(resetGuard());
    }
}