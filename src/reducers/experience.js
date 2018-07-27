import {
    ADD_DOC_BEGIN,     
    ADD_DOC_SUCCESS,   
    ADD_DOC_ERROR,     
    REMOVE_DOC_BEGIN,  
    REMOVE_DOC_SUCCESS,
    REMOVE_DOC_ERROR 
  } from '../actions/experience'
  
  const initialState = {
    user: null,
    experienceToDelete: null,
    experienceToAdd: null,
    loading: false,
    success: null,
    error: null
  };
  
  export default function experienceReducer(state = initialState, action) {
    switch(action.type) {
  
        case REMOVE_DOC_BEGIN:
            return {
                ...state,
                user: action.user,
                loading: true,
                experienceToAdd: null,
                experienceToDelete: action.experience,
                success: null
            };

        case REMOVE_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                user: action.user,
                success: action.success
            };
  
        case REMOVE_DOC_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };

        case ADD_DOC_BEGIN:
            return {
                ...state,
                user: action.user,
                loading: true,
                experienceToAdd: action.experience,
                experienceToDelete: null,
                success: null
            };

        case ADD_DOC_SUCCESS:
            return {
                ...state,
                loading: false,
                user: action.user,
                success: action.success
            };
  
        case ADD_DOC_ERROR:
            return {
                ...state,
                loading: false,
                error: action.error
            };
            
        default:
            return state;
        }
  }
    
  