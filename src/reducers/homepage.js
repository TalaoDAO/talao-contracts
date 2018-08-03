import {
    FREELANCER_ADDRESS_CHANGE,
    GOTO_CREATE_VAULT,
    GOTO_FREELANCER
  } from '../actions/homepage'
  
  const initialState = {
    freelancerAddress: '',
    freelancerAddressError: false,
    freelancerAddressEmpty: true,
    invalidAddress: 'This is not a valid ethereum address',
    emptyAddress: 'This field can\'t be empty'
  };
  
  export default function homepageReducer(state = initialState, action) {
    switch(action.type) {
  
      case FREELANCER_ADDRESS_CHANGE:
      return {
        ...state,
        freelancerAddress: action.address,
        freelancerAddressError: action.error,
        freelancerAddressEmpty: action.errorEmpty
      };

      case GOTO_CREATE_VAULT:
      return {
        ...state
      };

      case GOTO_FREELANCER:
      return {
        ...state
      };

      default:
        // ALWAYS have a default case in a reducer
        return state;
    }
  }
    
  