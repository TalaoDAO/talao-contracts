import {
  TRANSACTION_HASH, 
  TRANSACTION_RECEIPT,
  TRANSACTION_ERROR,
  RESET_TRANSACTION,
  TRANSACTION_BEGIN
} from '../actions/transactions'

const initialState = {
  transactionHash: null,
  transactionReceipt: null,
  transactionError: null,
  transaction: null
};

export default function transactionReducer(state = initialState, action) {
  switch(action.type) {

    case TRANSACTION_BEGIN:
    return {
      ...state,
      transaction: true,
      transactionReceipt: null,
      transactionError: null,
      transactionHash: null
    };

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
      transactionError: action.error,
      transaction: false
    };

    case TRANSACTION_ERROR:
    return {
      ...state,
      transactionReceipt: null,
      transactionError: action.error,
      transaction: false
    };

    case RESET_TRANSACTION:
      return {
        ...state,
        transactionHash: null,
        transactionReceipt: null,
        transactionError: null,
        transaction: false
    };
    default:
      // ALWAYS have a default case in a reducer
      return state;
  }
}
  
