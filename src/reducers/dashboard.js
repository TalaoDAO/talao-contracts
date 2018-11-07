import {
    GET_DASHBOARD_BEGIN,
    GET_DASHBOARD_SUCCESS,
    GET_DASHBOARD_ERROR,
    DELETE_ASYNC_BEGIN,
    DELETE_ASYNC_SUCCESS,
    DELETE_ASYNC_ERROR
  } from '../actions/dashboard'

  const initialState = {
      loading: false,
      error: null,
      experiences: [],
      organizations: [],
      certificates: []
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
        experiences: Object.assign([], action.experiences),
        organizations: Object.assign([], action.organizations),
        certificates: Object.assign([], action.certificates)
      };

      case GET_DASHBOARD_ERROR:
      return {
        ...state,
        loading: false,
        error: action.error
      };

      case DELETE_ASYNC_BEGIN:
      return {
        ...state,
        loading: true,
        error: null
      };

      case DELETE_ASYNC_SUCCESS:
      return {
        ...state,
        loading: false,
        certificates: Object.assign([], action.certificates)
      };

      case DELETE_ASYNC_ERROR:
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
