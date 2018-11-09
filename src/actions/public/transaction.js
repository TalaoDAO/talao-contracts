export const TRANSACTION_BEGIN          = 'TRANSACTION_BEGIN';
export const TRANSACTION_HASH           = 'TRANSACTION_HASH';
export const TRANSACTION_RECEIPT        = 'TRANSACTION_RECEIPT';
export const TRANSACTION_CONFIRMATION   = 'TRANSACTION_CONFIRMATION';
export const TRANSACTION_ERROR          = 'TRANSACTION_ERROR';
export const TRANSACTION_SUCCESS        = 'TRANSACTION_SUCCESS';
export const RESET_TRANSACTION          = 'RESET_TRANSACTION';

export const transactionBegin = object => ({
  type: TRANSACTION_BEGIN,
  object
});

export const transactionHash = txHash => ({
  type: TRANSACTION_HASH,
  txHash
});

export const transactionReceipt = receipt => ({
  type: TRANSACTION_RECEIPT,
  receipt
});

export const transactionConfirmation = (confNumber, receipt) => ({
  type: TRANSACTION_CONFIRMATION,
  receipt,
  confNumber
});

export const transactionError = error => ({
  type: TRANSACTION_ERROR,
  error
});

export const transactionSuccess = receipt => ({
  type: TRANSACTION_SUCCESS,
  receipt
});

export const resetTransaction = () => ({
  type: RESET_TRANSACTION
});
