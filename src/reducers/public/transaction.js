import {
  TRANSACTION_HASH,
  TRANSACTION_RECEIPT,
  TRANSACTION_ERROR,
  RESET_TRANSACTION,
  TRANSACTION_BEGIN
} from '../../actions/public/transaction'

const initialState = {
  transactionHash: null,
  transactionReceipt: null,
  transactionError: null,
  object: null
};

export default function transactionReducer(state = initialState, action) {
  switch(action.type) {

    case TRANSACTION_BEGIN:
    return {
      ...state,
      transactionReceipt: null,
      transactionError: null,
      transactionHash: null,
      object: action.object
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
      transactionReceipt: action.receipt
    };

    case TRANSACTION_ERROR:
    return {
      ...state,
      transactionReceipt: null,
      transactionError: action.error
    };

    case RESET_TRANSACTION:
    return {
      ...state,
      transactionHash: null,
      transactionReceipt: null,
      transactionError: null,
      object: null
    };
    default:
    // ALWAYS have a default case in a reducer
    return state;
  }
}