import {
    GUARD_ERROR,
    GUARD_BEGIN,
    GUARD_VALID,
    RESET_GUARD,
    GUARD_REDIRECT
  } from '../actions/guard'
  
  const initialState = {
    loading: true,
    message: '',
    guardCheck: false,
    guardRedirect: ''
  };
  
  export default function guardReducer(state = initialState, action) {
    switch(action.type) {
  
      case GUARD_ERROR:
      return {
        ...state,
        loading: false,
        message: action.message,
        guardCheck: false
      };

      case GUARD_BEGIN:
      return {
        ...state,
        loading: true,
        guardCheck: false
      };

      case GUARD_VALID:
      return {
        ...state,
        loading: false,
        message: '',
        guardCheck: true
      };

      case RESET_GUARD:
        return {
          ...state,
          loading: false,
          message: '',
          guardCheck: false
        };

      case GUARD_REDIRECT:
        return {
          ...state,
          loading: false,
          message: '',
          guardRedirect: action.redirectTo
        };

      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }
    
  