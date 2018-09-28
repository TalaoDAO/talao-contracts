import {
    GET_DASHBOARD_BEGIN, 
    GET_DASHBOARD_SUCCESS,
    GET_DASHBOARD_ERROR
  } from '../actions/dashboard'
  
  const initialState = {
      loading: false,
      error: null,
      experiences: null
  };
  
  export default function dashboardReducer(state = initialState, action) {
    switch(action.type) {
  
      case GET_DASHBOARD_BEGIN:
      return {
        ...state,
        loading: true
      };
  
      case GET_DASHBOARD_SUCCESS:
      return {
        ...state,
        loading: false,
        experiences: action.experiences
      };
  
      case GET_DASHBOARD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };

      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }
    
  