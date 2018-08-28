import {
    REDIRECT  
  } from '../actions/menu'
  
  const initialState = {
    selectedMenu: window.location.pathname.toLowerCase()
  };
  
  export default function menuReducer(state = initialState, action) {
    switch(action.type) {
  
      case REDIRECT:
      return {
        ...state,
        selectedMenu: action.selectedMenu
      };

      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }
    
  