import {
    CHANGE_MENU_SELECTED  
  } from '../actions/menu'
  
  const initialState = {
    selectedMenu: window.location.pathname.toLowerCase()
  };
  
  export default function menuReducer(state = initialState, action) {
    switch(action.type) {
  
      case CHANGE_MENU_SELECTED:
      return {
        ...state,
        selectedMenu: action.selectedMenu
      };

      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }
    
  