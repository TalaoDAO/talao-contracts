import { resetGuard } from '../actions/guard'
import { resetTransaction } from './transactions';
export const CHANGE_MENU_SELECTED     = 'CHANGE_MENU_SELECTED';


export const changeMenu = selectedMenu => ({
    type: CHANGE_MENU_SELECTED,
    selectedMenu
  });

export function changeMenuClicked(address) {
    return dispatch => {
        if (address !== '/transaction')
            dispatch(resetTransaction());
        dispatch(changeMenu(address));
        dispatch(resetGuard());
    }
}