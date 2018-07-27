import {
  TRANSACTION_HASH, 
  TRANSACTION_RECEIPT,
  TRANSACTION_ERROR          
} from '../actions/transactions'

const initialState = {
  transactionHash: null,
  transactionReceipt: null,
  transactionError: null
};

export default function transactionReducer(state = initialState, action) {
  switch(action.type) {

    case TRANSACTION_HASH:
    return {
      ...state,
      transactionReceipt: null,
      transactionError: null,
      transactionHash: action.txHash
    };

    case TRANSACTION_RECEIPT:
    return {
      ...state,
      transactionReceipt: action.receipt,
    };

    case TRANSACTION_ERROR:
    return {
      ...state,
      transactionError: action.error,
    };

    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
  
