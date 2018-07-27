export const TRANSACTION_HASH     = 'TRANSACTION_HASH';
export const TRANSACTION_RECEIPT  = 'TRANSACTION_RECEIPT';
export const TRANSACTION_ERROR    = 'TRANSACTION_ERROR';

export const transactionHash = txHash => ({
    type: TRANSACTION_HASH,
    txHash
  });

export const transactionReceipt = receipt => ({
    type: TRANSACTION_RECEIPT,
    receipt
});

export const transactionError = error => ({
    type: TRANSACTION_ERROR,
    error
});